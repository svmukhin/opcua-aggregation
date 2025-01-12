using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace OpcuaAggregationClient.Infrastructure;

public class ClientsBootstrap(
    UaClientConfigurationStore uaClientConfigurationStore,
    UaClientManager clientManager,
    ILogger<ClientsBootstrap> logger
) : IHostedService, IDisposable
{
    private readonly UaClientConfigurationStore _uaClientConfigurationStore = uaClientConfigurationStore;
    private readonly UaClientManager _clientManager = clientManager;
    private readonly ILogger<ClientsBootstrap> _logger = logger;
    private Task? _executingTask;
    private readonly CancellationTokenSource _stoppingCts = new();

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
            foreach (var config in await _uaClientConfigurationStore.GetUaClientConfigurationsAsync(stoppingToken))
            {
                if(config.Enabled == false)
                {
                    _logger.LogInformation("Client {sessionName} is disabled", config.SessionName);
                    continue;
                }

                await _clientManager.StartUaClientAsync(config, stoppingToken);
            }
            _logger.LogInformation("All clients started");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting clients");
            throw;
        }

        while(!stoppingToken.IsCancellationRequested)
        {
            foreach (var config in await _uaClientConfigurationStore.GetUaClientConfigurationsAsync(stoppingToken))
            {
                if(_clientManager.ClientExists(config.Id!.Value))
                {
                    _logger.LogInformation("Client {sessionName} is already running", config.SessionName);
                    continue;
                }

                if(config.Enabled == false)
                {
                    _logger.LogInformation("Client {sessionName} is disabled", config.SessionName);
                    continue;
                }

                await _clientManager.StartUaClientAsync(config, stoppingToken);
            }

            await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
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
        }
    }

    public void Dispose()
    {
        _stoppingCts.Cancel();
        GC.SuppressFinalize(this);
    }
}