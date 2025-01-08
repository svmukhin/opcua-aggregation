using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Opc.Ua;
using Opc.Ua.Configuration;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Infrastructure;

public class UaClientFactory(
    ILoggerFactory loggerFactory,
    IMemoryCache memoryCache
)
{
    private readonly ILoggerFactory _loggerFactory = loggerFactory;
    private readonly IMemoryCache _memoryCache = memoryCache;
    private ApplicationInstance? _application;
    private readonly object _lock = new();

    public UaClient GetInstance(UaClientConfiguration clientConfiguration)
    {
        if (_application == null)
        {
            lock (_lock)
            {
                if (_application == null)
                {
                    _application = new ApplicationInstance
                    {
                        ApplicationName = "OpcuaAggregation",
                        ApplicationType = ApplicationType.Client,
                        ConfigSectionName = "OpcuaAggregation.OpcUaClient"
                    };

                    _application.LoadApplicationConfiguration(silent: false).ConfigureAwait(false);
                    _application.CheckApplicationInstanceCertificate(silent: false, minimumKeySize: 0);
                }
            }
        }

        return new UaClient(
            clientConfiguration,
            _application.ApplicationConfiguration,
            _loggerFactory.CreateLogger<UaClient>(),
            ClientBase.ValidateResponse,
            _memoryCache);
    }
}