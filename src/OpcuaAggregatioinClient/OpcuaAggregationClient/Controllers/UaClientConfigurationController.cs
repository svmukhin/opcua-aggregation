using Microsoft.AspNetCore.Mvc;
using OpcuaAggregationClient.Infrastructure;

namespace OpcuaAggregationClient.Controllers;

[ApiController]
[Route("/api/aggregation/config")]
public class UaClientConfigurationController(
    UaClientConfigurationStore store
) : ControllerBase
{
    private readonly UaClientConfigurationStore _store = store;

    [HttpGet("client")]
    public async Task<IActionResult> GetClientConfiguration([FromQuery] int? clientId, CancellationToken ct)
    {
        if (clientId is not null)
        {
            var config = await _store.GetUaClientConfigurationByIdAsync(clientId.Value, ct);
            return new JsonResult(config);
        }

        var configs = await _store.GetUaClientConfigurationsAsync(ct);

        return new JsonResult(configs);
    }

    [HttpGet("channel")]
    public async Task<IActionResult> GetClientConfigurationChannel([FromQuery] (int clientId, int? channelId) query, CancellationToken ct)
    {
        if (query.clientId <= 0 && query.channelId is null)
        {
            return new JsonResult(new { Error = "At least one parameter must be set (clientId or channelId)!" });
        }

        if (query.channelId is not null)
        {
            var channel = await _store.GetUaClientChannelConfigurationByIdAsync(query.channelId.Value, ct);
            return new JsonResult(channel);
        }

        var channels = await _store.GetUaClientChannelConfigurationsAsync(query.clientId, ct);
        return new JsonResult(channels);
    }
}