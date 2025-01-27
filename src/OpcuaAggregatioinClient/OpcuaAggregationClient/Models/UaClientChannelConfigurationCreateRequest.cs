namespace OpcuaAggregationClient.Controllers;

public class UaClientChannelConfigurationCreateRequest
{
    public required string NodeId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public required int ClientId { get; set; }
}