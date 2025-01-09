using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Infrastructure;

public class ClientsBootstrap(
    UaClientConfigurationStore uaClientConfigurationStore,
    UaClientFactory uaClientFactory,
    ILogger<ClientsBootstrap> logger
) : IHostedService, IDisposable
{
    private readonly UaClientConfigurationStore _uaClientConfigurationStore = uaClientConfigurationStore;
    private readonly UaClientFactory _uaClientFactory = uaClientFactory;
    private readonly ILogger<ClientsBootstrap> _logger = logger;
    private Task? _executingTask;
    private readonly CancellationTokenSource _stoppingCts = new();
    private readonly List<UaClient> _uaClients = [];

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _executingTask = ExecuteAsync(_stoppingCts.Token);

        if (_executingTask.IsCompleted)
            return _executingTask;

        return Task.CompletedTask;
    }

    private async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var tasks = new List<Task>();

        try
        {
            foreach (var config in await _uaClientConfigurationStore.GetUaClientConfigurationsAsync(stoppingToken))
            {
                if(config.Enabled == false)
                {
                    _logger.LogInformation("Client {sessionName} is disabled", config.SessionName);
                    continue;
                }

                tasks.Add(StartUaClientAsync(config, stoppingToken));
            }
            await Task.WhenAll(tasks);
            _logger.LogInformation("All clients started");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting clients");
            throw;
        }

        while(!stoppingToken.IsCancellationRequested)
        {
            tasks.Clear();
            foreach (var config in await _uaClientConfigurationStore.GetUaClientConfigurationsAsync(stoppingToken))
            {
                if(_uaClients.FindIndex(c => c.ClientId == config.Id) != -1)
                {
                    _logger.LogInformation("Client {sessionName} is already running", config.SessionName);
                    continue;
                }

                if(config.Enabled == false)
                {
                    _logger.LogInformation("Client {sessionName} is disabled", config.SessionName);
                    continue;
                }

                tasks.Add(StartUaClientAsync(config, stoppingToken));
            }

            if(tasks.Count > 0)
            {
                await Task.WhenAll(tasks);
            }

            await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
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
        var connected = await client.ConnectAsync(config.ServerUri);
        if(!connected)
        {
            _logger.LogError("Failed to connect to {serverUri}", config.ServerUri);
            return;
        }

        _uaClients.Add(client);

        var channels = await _uaClientConfigurationStore.GetUaClientChannelConfigurationsAsync(config.Id.Value);
        client.AddSubscription(channels, config.SessionName);
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
                foreach (var client in _uaClients)
                {
                    await client.Disconnect();
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