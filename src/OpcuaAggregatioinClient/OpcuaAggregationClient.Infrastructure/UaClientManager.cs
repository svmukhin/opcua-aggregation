using Microsoft.Extensions.Logging;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Infrastructure;

public class UaClientManager(
    UaClientConfigurationStore uaClientConfigurationStore,
    UaClientFactory clientFactory,
    ILogger<UaClientManager> logger
)
{
    private readonly UaClientConfigurationStore _uaClientConfigurationStore = uaClientConfigurationStore;
    private readonly UaClientFactory _clientFactory = clientFactory;
    private readonly ILogger<UaClientManager> _logger = logger;
    private List<UaClient> _clients = [];

    public async Task StartUaClientAsync(UaClientConfiguration config, CancellationToken cancellationToken = default)
    {
        if (config.Id is null)
        {
            _logger.LogError("Client configuration {config} does not have an Id", config);
            return;
        }

        var client = _clientFactory.GetInstance(config);
        var connected = await client.ConnectAsync(config.ServerUri, false);
        if (!connected)
        {
            _logger.LogError("Failed to connect to {serverUri}", config.ServerUri);
            return;
        }

        _clients.Add(client);

        var channels = await _uaClientConfigurationStore.GetUaClientChannelConfigurationsAsync(config.Id.Value);
        await client.AddSubscription(channels, config.SessionName);
    }

    public async Task StopUaClientAsync(int configId)
    {
        var client = _clients.FirstOrDefault(c => c.ClientId == configId);
        if (client is null)
        {
            _logger.LogError("Client with id {configId} not found", configId);
            return;
        }

        await client.Disconnect();
        _clients.Remove(client);
        client.Dispose();
    }

    public bool ClientExists(int configId) => _clients.FindIndex(c => c.ClientId == configId) != -1;

    public async Task DisposeClientsAsync()
    {
        if (_clients.Count > 0)
        {
            var tasks = new List<Task>();

            foreach (var client in _clients)
            {
                tasks.Add(client.Disconnect());
            }

            await Task.WhenAll(tasks);

            foreach (var client in _clients)
            {
                client.Dispose();
            }
        }

        _logger.LogInformation("Ua clients stopped.");
    }

    public UaClientStatus? GetClientStatusById(int id) => _clients.FirstOrDefault(c => c.ClientId == id)?.GetStatus();

    public IEnumerable<UaClientStatus> GetClientsStatus() => _clients.Select(c => c.GetStatus());
}
