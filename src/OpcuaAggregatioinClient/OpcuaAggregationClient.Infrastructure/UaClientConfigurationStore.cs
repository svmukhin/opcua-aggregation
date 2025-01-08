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

    public async Task<IEnumerable<UaClientConfiguration>> GetUaClientConfigurationsAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var query = """
        select * from session
        """;

        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
        return await connection.QueryAsync<UaClientConfiguration>(query);
    }

    public async Task<IEnumerable<UaClientChannelConfiguration>> GetUaClientChannelConfigurationsAsync(int clientId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var query = """
        select * from channel
        where id_session = @clientId
        """;

        var queryParameters = new { clientId };

        using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);
        return await connection.QueryAsync<UaClientChannelConfiguration>(query, queryParameters);
    }
}