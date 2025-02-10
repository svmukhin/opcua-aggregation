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

    public async Task<int> AddUaClientConfigurationAsync(UaClientConfiguration configuration, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        insert into session ("sessionName", "serverUri", "sessionLifetime", "keepAliveInterval", "reconnectPeriod", description, enabled)
        values (@SessionName, @ServerUri, @SessionLifetime, @KeepAliveInterval, @ReconnectPeriod, @Description, @Enabled)
        returning id
        """;

        var queryParams = new
        {
            configuration.SessionName,
            configuration.ServerUri,
            configuration.SessionLifetime,
            configuration.KeepAliveInterval,
            configuration.ReconnectPeriod,
            configuration.Description,
            configuration.Enabled
        };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.ExecuteScalarAsync<int>(query, queryParams);
    }

    public async Task<int> UpdateUaClientConfigurationAsync(UaClientConfiguration configuration, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        update session
        set 
            "sessionName" = @SessionName, 
            "serverUri" = @ServerUri, 
            "sessionLifetime" = @SessionLifetime, 
            "keepAliveInterval" = @KeepAliveInterval, 
            "reconnectPeriod" = @ReconnectPeriod, 
            description = @Description, 
            enabled = @Enabled
        where id = @Id
        """;

        var queryParams = new
        {
            configuration.SessionName,
            configuration.ServerUri,
            configuration.SessionLifetime,
            configuration.KeepAliveInterval,
            configuration.ReconnectPeriod,
            configuration.Description,
            configuration.Enabled,
            configuration.Id
        };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.ExecuteAsync(query, queryParams);
    }

    public async Task<int> DeleteUaClientConfigurationAsync(int id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        delete from session
        where id = @id
        """;

        var queryParams = new { id };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.ExecuteAsync(query, queryParams);
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

    public async Task<int> AddUaClientChannelConfigurationAsync(UaClientChannelConfiguration configuration, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        insert into channel (name, "nodeId", description, id_session)
        values (@Name, @NodeId, @Description, @ClientId)
        returning id
        """;

        var queryParams = new
        {
            configuration.Name,
            configuration.NodeId,
            configuration.Description,
            configuration.ClientId
        };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.ExecuteScalarAsync<int>(query, queryParams);
    }

    public async Task<int> UpdateUaClientChannelConfigurationAsync(UaClientChannelConfiguration configuration, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        update channel
        set 
            name = @Name, 
            "nodeId" = @NodeId, 
            description = @Description, 
            id_session = @ClientId
        where id = @Id
        """;

        var queryParams = new
        {
            configuration.Name,
            configuration.NodeId,
            configuration.Description,
            configuration.ClientId,
            configuration.Id
        };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.ExecuteAsync(query, queryParams);
    }

    public async Task<int> DeleteUaClientChannelConfigurationAsync(int id, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        var query = """
        delete from channel
        where id = @id
        """;

        var queryParams = new { id };

        using var connection = await _dataSource.OpenConnectionAsync(ct);
        return await connection.ExecuteAsync(query, queryParams);
    }
}