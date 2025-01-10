namespace OpcuaAggregationClient.Infrastructure.Entities;

public record AggregationTag(object Value, int StatusCode, DateTime Timestamp);