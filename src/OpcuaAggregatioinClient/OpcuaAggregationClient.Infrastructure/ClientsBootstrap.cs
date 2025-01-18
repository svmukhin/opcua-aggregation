using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Opc.Ua;

namespace OpcuaAggregationClient.Infrastructure;

public class ClientsBootstrap : IHostedService, IDisposable
{
    private const int FindNewClientsForStartInterval = 15;
    private readonly UaClientConfigurationStore _uaClientConfigurationStore;
    private readonly UaClientManager _clientManager;
    private readonly ILoggerFactory _loggerFactory;
    private readonly ILogger<ClientsBootstrap> _logger;
    private Task? _executingTask;
    private readonly CancellationTokenSource _stoppingCts = new();
    private SemaphoreSlim _semaphore;

    public ClientsBootstrap(
        UaClientConfigurationStore uaClientConfigurationStore,
        UaClientManager clientManager,
        IConfiguration configuration,
        ILoggerFactory loggerFactory
    )
    {
        _uaClientConfigurationStore = uaClientConfigurationStore;
        _clientManager = clientManager;
        _loggerFactory = loggerFactory;
        _logger = loggerFactory.CreateLogger<ClientsBootstrap>();
        Utils.SetLogger(_loggerFactory.CreateLogger("OpcUaUtilsLogger"));

        if(int.TryParse(configuration.GetSection("ClientsBootstrapSettings:MaxConcurrentStartingClients").Value, out var maxConcurrentStartingClients))
        {
            _semaphore = new SemaphoreSlim(maxConcurrentStartingClients, maxConcurrentStartingClients);
        }
        else
        {
            _semaphore = new SemaphoreSlim(10,10);
        }
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        

        _executingTask = ExecuteAsync(_stoppingCts.Token);

        if (_executingTask.IsCompleted)
            return _executingTask;

        return Task.CompletedTask;
    }

    private async Task ExecuteAsync(CancellationToken stoppingToken)
    {       
        
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                foreach (var config in await _uaClientConfigurationStore.GetUaClientConfigurationsAsync(stoppingToken))
                {
                    if (_clientManager.ClientExists(config.Id.Value))
                    {
                        _logger.LogInformation("Client {sessionName} is already running", config.SessionName);
                        continue;
                    }

                    if (config.Enabled == false)
                    {
                        _logger.LogInformation("Client {sessionName} is disabled", config.SessionName);
                        continue;
                    }

                    await _semaphore.WaitAsync(stoppingToken);
                    _ = _clientManager
                            .StartUaClientAsync(config, stoppingToken)
                            .ContinueWith(t => _semaphore.Release(), stoppingToken);
                }

                await Task.Delay(TimeSpan.FromSeconds(FindNewClientsForStartInterval), stoppingToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting clients");
            throw;
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_executingTask == null)
            return;

        try
        {
            _stoppingCts.Cancel();
        }
        finally
        {
            await _clientManager.DisposeClientsAsync();
            _logger.LogInformation("Ua clients stopped.");
        }
    }

    public void Dispose()
    {
        _stoppingCts.Cancel();
        GC.SuppressFinalize(this);
    }
}