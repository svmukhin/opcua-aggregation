using Microsoft.Extensions.DependencyInjection;

namespace OpcuaAggregationClient.Infrastructure;

public static class ServiceRegistration
{
    public static void AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddSingleton<UaClientFactory>();
    }
}