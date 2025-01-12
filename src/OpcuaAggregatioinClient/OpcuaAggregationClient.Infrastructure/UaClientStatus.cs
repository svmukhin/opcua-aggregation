namespace OpcuaAggregationClient.Infrastructure;

public class UaClientStatus
{
    public int Id { get; set; }
    public string? SessionName { get; set; }
    public string? ServerUri { get; set; }
    public int ConnectError { get; set; }
    public IEnumerable<string>? MonitoredItems { get; set; }
}
