namespace OpcuaAggregationClient.Infrastructure.Entities;

public class UaClientChannelConfiguration
{
    public int? Id { get; set; }
    public required string NodeId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public required int ClientId { get; set; }
}