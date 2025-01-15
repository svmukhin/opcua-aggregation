using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Opc.Ua;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Infrastructure;

public class ClientsBootstrap : IHostedService, IDisposable
{
    private readonly UaClientConfigurationStore _uaClientConfigurationStore;
    private readonly UaClientFactory _uaClientFactory;
    private readonly ILoggerFactory _loggerFactory;
    private readonly ILogger<ClientsBootstrap> _logger;
    private Task? _executingTask;
    private readonly CancellationTokenSource _stoppingCts = new();
    private SemaphoreSlim _semaphore;
    private readonly List<UaClient> _uaClients = [];

    public ClientsBootstrap(
        UaClientConfigurationStore uaClientConfigurationStore,
        UaClientFactory uaClientFactory,
        IConfiguration configuration,
        ILoggerFactory loggerFactory
)
    {
        _uaClientConfigurationStore = uaClientConfigurationStore;
        _uaClientFactory = uaClientFactory;
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
            await StartClientsAsync(stoppingToken);
            _logger.LogInformation("All clients started");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting clients");
            throw;
        }

        while(!stoppingToken.IsCancellationRequested)
        {
            await StartClientsAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
        }
    }

    private async Task StartClientsAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                foreach (var config in await _uaClientConfigurationStore.GetUaClientConfigurationsAsync(stoppingToken))
                {
                    if (_uaClients.FindIndex(c => c.ClientId == config.Id) != -1)
                    {
                        _logger.LogInformation("Client {sessionName} is already running", config.SessionName);
                        continue;
                    }

                    if (config.Enabled == false)
                    {
                        _logger.LogInformation("Client {sessionName} is disabled", config.SessionName);
                        continue;
                    }

                    await _semaphore.WaitAsync(stoppingToken); // Wait to enter the semaphore
                    _ = StartUaClientAsync(config, stoppingToken).ContinueWith(t => _semaphore.Release(), stoppingToken); // Release the semaphore after execution
                }

                await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting clients");
            throw;
        }
    }

    private async Task StartUaClientAsync(UaClientConfiguration config, CancellationToken cancellationToken = default)
    {
        if(config.Id is null)
        {
            _logger.LogError("Client configuration {config} does not have an Id", config);
            return;
        }
        
        var client = _uaClientFactory.GetInstance(config);
        var connected = await client.ConnectAsync(config.ServerUri, false);
        if(!connected)
        {
            _logger.LogError("Failed to connect to {serverUri}", config.ServerUri);
            return;
        }

        _uaClients.Add(client);

        var channels = await _uaClientConfigurationStore.GetUaClientChannelConfigurationsAsync(config.Id.Value);
        await client.AddSubscription(channels, config.SessionName);
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
            if(_uaClients.Count > 0)
            {
                var tasks = new List<Task>();

                foreach (var client in _uaClients)
                {
                    tasks.Add(client.Disconnect());
                }

                await Task.WhenAll(tasks);

                foreach (var client in _uaClients)
                {
                    client.Dispose();
                }
            }

            _logger.LogInformation("Ua clients stopped.");
        }
    }

    public void Dispose()
    {
        _stoppingCts.Cancel();
        GC.SuppressFinalize(this);
    }
}