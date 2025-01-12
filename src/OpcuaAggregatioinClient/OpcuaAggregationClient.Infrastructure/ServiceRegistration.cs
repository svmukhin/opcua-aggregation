using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace OpcuaAggregationClient.Infrastructure;

public static class ServiceRegistration
{
    public static void AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddKeyedSingleton("DefaultDataSource", Npgsql.NpgsqlDataSource.Create(configuration.GetConnectionString("DefaultConnection")!));
        services.AddSingleton<UaClientFactory>();
        services.AddSingleton<UaClientConfigurationStore>();
        services.AddSingleton<UaClientManager>();
        services.AddHostedService<ClientsBootstrap>();
    }
}
