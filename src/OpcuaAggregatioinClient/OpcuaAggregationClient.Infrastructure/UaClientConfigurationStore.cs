using Dapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Infrastructure;

public class UaClientConfigurationStore(
    [FromKeyedServices("DefaultDataSource")] NpgsqlDataSource dataSource,
    ILogger<UaClientConfigurationStore> logger
)
{
    private readonly NpgsqlDataSource _dataSource = dataSource;
    private readonly ILogger<UaClientConfigurationStore> _logger = logger;

    public async Task<IEnumerable<UaClientConfiguration>> GetUaClientConfigurationsAsync(CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        select * from session
        """;

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.QueryAsync<UaClientConfiguration>(query);
    }

    public async Task<UaClientConfiguration> GetUaClientConfigurationByIdAsync(int id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        select * from session
        where id = @id
        """;

        var queryParams = new { id };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.QuerySingleAsync<UaClientConfiguration>(query, queryParams);
    }

    public async Task<IEnumerable<UaClientChannelConfiguration>> GetUaClientChannelConfigurationsAsync(int clientId, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        select * from channel
        where id_session = @clientId
        """;

        var queryParams = new { clientId };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.QueryAsync<UaClientChannelConfiguration>(query, queryParams);
    }

    public async Task<UaClientChannelConfiguration> GetUaClientChannelConfigurationByIdAsync(int id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        select * from channel
        where id = @id
        """;

        var queryParams = new { id };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.QuerySingleAsync<UaClientChannelConfiguration>(query, queryParams);
    }
}