namespace OpcuaAggregationClient.Infrastructure.Entities;

public record AggregationTag(object Value, uint StatusCode, DateTime Timestamp);