public class UaClientConfigurationUpdateRequest
{
    public string? ServerUri { get; set; }
    public string? SessionName { get; set; }
    public int? KeepAliveInterval { get; set; }
    public int? ReconnectPeriod { get; set; }
    public int? SessionLifetime { get; set; }
    public string? Description { get; set; }
    public bool? Enabled { get; set; }
}
