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
    public async Task<IActionResult> GetClientConfiguration(CancellationToken ct)
    {
        var configs = await _store.GetUaClientConfigurationsAsync(ct);
        return new JsonResult(configs);
    }

    [HttpGet("client/{id:int}")]
    public async Task<IActionResult> GetClientConfigurationById(int id, CancellationToken ct)
    {
        var config = await _store.GetUaClientConfigurationByIdAsync(id, ct);
        return new JsonResult(config);
    }

    [HttpGet("client/{clientId:int}/channel")]
    public async Task<IActionResult> GetClientConfigurationChannel(int clientId, CancellationToken ct)
    {
        var channels = await _store.GetUaClientChannelConfigurationsAsync(clientId, ct);
        return new JsonResult(channels);
    }

    [HttpGet("client/channel/{id:int}")]
    public async Task<IActionResult> GetClientConfigurationChannelById(int id, CancellationToken ct)
    {
        var channel = await _store.GetUaClientChannelConfigurationByIdAsync(id, ct);
        return new JsonResult(channel);
    }
}