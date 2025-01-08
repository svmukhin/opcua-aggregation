namespace OpcuaAggregationClient.Infrastructure.Entities;

public class UaClientConfiguration
{
    public int? Id { get; set; }
    public required string ServerUri { get; set; }
    public required string SessionName { get; set; }
    public int KeepAliveInterval { get; set; }
    public int ReconnectPeriod { get; set; }
    public int SessionLifetime { get; set; }
    public string? Description { get; set; }
    public bool Enabled { get; set; }
}
