using Microsoft.AspNetCore.Mvc;
using OpcuaAggregationClient.Infrastructure;
using OpcuaAggregationClient.Infrastructure.Entities;

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

    [HttpPost("client")]
    public async Task<IActionResult> CreateClientConfiguration(
        [FromBody] UaClientConfigurationCreateRequest request,
        CancellationToken ct)
    {
        var config = new UaClientConfiguration
        {
            SessionName = request.SessionName,
            ServerUri = request.ServerUri,
            Description = request.Description ?? "",
            KeepAliveInterval = request.KeepAliveInterval ?? 15000,
            ReconnectPeriod = request.ReconnectPeriod ?? 30000,
            SessionLifetime = request.SessionLifetime ?? 60000,
            Enabled = request.Enabled ?? false
        };

        var id = await _store.AddUaClientConfigurationAsync(config, ct);
        if (id <= 0)
            return new JsonResult(new { Error = "Error accured while create client configuration." });

        config.Id = id;
        return new JsonResult(config);
    }

    [HttpPut("client/{id:int}")]
    public async Task<IActionResult> UpdateClientConfiguration(
        int id,
        [FromBody] UaClientConfigurationUpdateRequest request,
        CancellationToken ct)
    {
        var config = await _store.GetUaClientConfigurationByIdAsync(id, ct);
        if (config is null)
        {
            return new JsonResult(new { Error = $"Configuration with id {id} not found." });
        }

        if (!string.IsNullOrEmpty(request.SessionName))
            config.SessionName = request.SessionName;

        if (!string.IsNullOrEmpty(request.ServerUri))
            config.ServerUri = request.ServerUri;

        if (!string.IsNullOrEmpty(request.Description))
            config.Description = request.Description;

        if (request.KeepAliveInterval is not null)
            config.KeepAliveInterval = request.KeepAliveInterval.Value;

        if (request.ReconnectPeriod is not null)
            config.ReconnectPeriod = request.ReconnectPeriod.Value;

        if (request.SessionLifetime is not null)
            config.SessionLifetime = request.SessionLifetime.Value;

        if (request.Enabled is not null)
            config.Enabled = request.Enabled.Value;

        var result = await _store.UpdateUaClientConfigurationAsync(config, ct);
        if (result > 0)
            return new JsonResult(new { Message = $"Ua client configuration with id {id} successfuly updated." });

        return new JsonResult(new { Error = $"Error accured while update configuration with id {id}." });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteClientConfiguration(int id, CancellationToken ct)
    {
        var config = await _store.GetUaClientConfigurationByIdAsync(id, ct);
        if (config is null)
            return new JsonResult(new { Error = $"Ua client configuration with id {id} not found" });

        var result = await _store.DeleteUaClientConfigurationAsync(id, ct);
        if (result > 0)
            return new JsonResult(config);

        return new JsonResult(new { Error = $"Error accured while delete configuration with id {id}." });
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
    [HttpPost("client/{clientId:int}/channel")]
    public async Task<IActionResult> CreateClientConfigurationChannel(
        int clientId,
        [FromBody] UaClientChannelConfigurationCreateRequest request,
        CancellationToken ct)
    {
        var channel = new UaClientChannelConfiguration
        {
            NodeId = request.NodeId,
            Name = request.Name,
            Description = request.Description,
            ClientId = clientId
        };

        var id = await _store.AddUaClientChannelConfigurationAsync(channel, ct);
        if (id <= 0)
            return new JsonResult(new { Error = "Error occurred while creating client channel configuration." });

        channel.Id = id;
        return new JsonResult(channel);
    }

    [HttpPut("client/channel/{id:int}")]
    public async Task<IActionResult> UpdateClientConfigurationChannel(
        int id,
        [FromBody] UaClientChannelConfigurationUpdateRequest request,
        CancellationToken ct)
    {
        var channel = await _store.GetUaClientChannelConfigurationByIdAsync(id, ct);
        if (channel is null)
        {
            return new JsonResult(new { Error = $"Channel configuration with id {id} not found." });
        }

        if (!string.IsNullOrEmpty(request.NodeId))
            channel.NodeId = request.NodeId;

        if (!string.IsNullOrEmpty(request.Name))
            channel.Name = request.Name;

        if (!string.IsNullOrEmpty(request.Description))
            channel.Description = request.Description;

        var result = await _store.UpdateUaClientChannelConfigurationAsync(channel, ct);
        if (result > 0)
            return new JsonResult(new { Message = $"Ua client channel configuration with id {id} successfully updated." });

        return new JsonResult(new { Error = $"Error occurred while updating channel configuration with id {id}." });
    }

    [HttpDelete("client/channel/{id:int}")]
    public async Task<IActionResult> DeleteClientConfigurationChannel(int id, CancellationToken ct)
    {
        var channel = await _store.GetUaClientChannelConfigurationByIdAsync(id, ct);
        if (channel is null)
            return new JsonResult(new { Error = $"Ua client channel configuration with id {id} not found" });

        var result = await _store.DeleteUaClientChannelConfigurationAsync(id, ct);
        if (result > 0)
            return new JsonResult(channel);

        return new JsonResult(new { Error = $"Error occurred while deleting channel configuration with id {id}." });
    }
}
