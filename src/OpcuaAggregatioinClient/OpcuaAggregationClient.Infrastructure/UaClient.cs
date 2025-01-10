using System.Collections;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Opc.Ua;
using Opc.Ua.Client;
using OpcuaAggregationClient.Infrastructure.Entities;

namespace OpcuaAggregationClient.Infrastructure;
public class UaClient(
    UaClientConfiguration uaClientConfiguration,
    ApplicationConfiguration configuration,
    ILogger<UaClient>  logger,
    Action<IList, IList> validateResponse,
    IMemoryCache memoryCache
) : IDisposable
{
    private readonly object _lock = new();
    private ISession? _session;
    private SessionReconnectHandler? _reconnectHandler;
    private readonly UaClientConfiguration _uaClientConfiguration = uaClientConfiguration;
    private readonly ApplicationConfiguration _configuration = configuration;
    private readonly ILogger _logger = logger;
    private readonly Action<IList, IList> _validateResponse = validateResponse;
    private readonly IMemoryCache _memoryCache = memoryCache;
    private readonly int _publishingInterval = 5000;
    private readonly int _samplingInterval = 2500;

    public Action<IList, IList> ValidateResponse => _validateResponse;
    public ISession? Session => _session;
    public int? ClientId => _uaClientConfiguration.Id;
    public int KeepAliveInterval { get; set; } = 5000;
    public int ReconnectPeriod { get; set; } = 10000;
    public uint SessionLifeTime { get; set; } = 30 * 1000;
    public bool AutoAccept { get; set; } = false;

    public async Task<bool> ConnectAsync(string serverUrl, bool useSecurity = true)
    {
        ArgumentNullException.ThrowIfNull(serverUrl);

        try
        {
            if (_session != null && _session.Connected == true)
            {
                _logger.LogInformation("Session already connected!");
            }
            else
            {
                _logger.LogInformation("Connecting to... {serverUrl}", serverUrl);
                EndpointDescription endpointDescription = CoreClientUtils.SelectEndpoint(_configuration, serverUrl, useSecurity);
                EndpointConfiguration endpointConfiguration = EndpointConfiguration.Create(_configuration);
                ConfiguredEndpoint endpoint = new(null, endpointDescription, endpointConfiguration);

                Session session = await Opc.Ua.Client.Session.Create(
                    _configuration,
                    endpoint,
                    false,
                    false,
                    _uaClientConfiguration.SessionName,
                    SessionLifeTime,
                    new UserIdentity(),
                    null
                );

                if (session != null && session.Connected)
                {
                    _session = session;
                    _session.KeepAliveInterval = KeepAliveInterval;
                    _session.KeepAlive += new KeepAliveEventHandler(OnKeepAlive);
                    _logger.LogInformation("New Session Created with SessionName = {SessionName}", _session.SessionName);
                }
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError("Create Session Error : {Message}", ex.Message);
            return false;
        }
    }

    public async Task Disconnect(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_session != null)
            {
                _logger.LogInformation("Disconnecting...");

                await _session.CloseAsync(cancellationToken);
                _session.Dispose();
                _session = null;

                _logger.LogInformation("Session Disconnected.");
            }
            else
            {
                _logger.LogInformation("Session not created!");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("Disconnect Error : {Message}", ex.Message);
        }
    }

    public void Dispose()
    {
        Utils.SilentDispose(_session);
        _configuration.CertificateValidator.CertificateValidation -= CertificateValidation;
        GC.SuppressFinalize(this);
    }

    private void OnKeepAlive(ISession session, KeepAliveEventArgs e)
    {
        try
        {
            if (!ReferenceEquals(session, _session))
            {
                return;
            }

            if (ServiceResult.IsBad(e.Status))
            {
                if (ReconnectPeriod <= 0)
                {
                    _logger.LogWarning("Session {SessionName}: KeepAlive status {Status}, but reconnect is disabled.", _session.SessionName, e.Status);
                    return;
                }

                lock (_lock)
                {
                    if (_reconnectHandler == null)
                    {
                        _logger.LogWarning("Session {SessionName}: KeepAlive status {Status}, reconnecting in {ReconnectPeriod}ms.", _session.SessionName, e.Status, ReconnectPeriod);
                        _reconnectHandler = new SessionReconnectHandler(true);
                        _reconnectHandler.BeginReconnect(_session, ReconnectPeriod, OnReconnectCompleted);
                    }
                    else
                    {
                        _logger.LogInformation("Session {SessionName}: KeepAlive status {Status}, reconnect in progress.", _session.SessionName, e.Status);
                    }
                }

                return;
            }
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Error in OnKeepAlive.");
        }
    }

    private void OnReconnectCompleted(object? sender, EventArgs e)
    {
        if (!ReferenceEquals(sender, _reconnectHandler))
        {
            return;
        }

        lock (_lock)
        {
            if (_reconnectHandler?.Session != null)
            {
                _session = _reconnectHandler.Session;
            }

            _reconnectHandler?.Dispose();
            _reconnectHandler = null;
        }

        _logger.LogInformation("Session {SessionName}: --- RECONNECTED ---", _session?.SessionName);
    }

    protected virtual void CertificateValidation(CertificateValidator sender, CertificateValidationEventArgs e)
    {
        bool certificateAccepted = false;

        ServiceResult error = e.Error;
        _logger.LogError("{Message}", error.ToString());
        if (error.StatusCode == StatusCodes.BadCertificateUntrusted && AutoAccept)
        {
            certificateAccepted = true;
        }

        if (certificateAccepted)
        {
            _logger.LogInformation("Untrusted Certificate accepted. Subject = {Certificate.Subject}", e.Certificate.Subject);
            e.Accept = true;
        }
        else
        {
            _logger.LogInformation("Untrusted Certificate rejected. Subject = {Certificate.Subject}", e.Certificate.Subject);
        }
    }

    public void AddSubscription(IEnumerable<UaClientChannelConfiguration> items, string subscriptionName = "default")
    {
        if (_session == null || _session.Connected == false)
        {
            _logger.LogWarning("Session not connected.");
            return;
        }

        try
        {
            Subscription subscription = new(_session.DefaultSubscription)
            {
                DisplayName = subscriptionName,
                PublishingEnabled = true,
                PublishingInterval = _publishingInterval
            };

            _session.AddSubscription(subscription);
            subscription.Create();

            foreach (var item in items)
            {
                MonitoredItem monitoredItem = new(subscription.DefaultItem)
                {
                    StartNodeId = new NodeId(item.NodeId),
                    AttributeId = Attributes.Value,
                    DisplayName = $"{subscriptionName}.{item.NodeId}",
                    SamplingInterval = _samplingInterval
                };
                monitoredItem.Notification += OnMonitoredItemNotification;

                subscription.AddItem(monitoredItem);
            }

            subscription.ApplyChanges();
        }
        catch (Exception ex)
        {
            _logger.LogError("{Message}", ex.Message);
            throw;
        }
    }

    private void OnMonitoredItemNotification(MonitoredItem monitoredItem, MonitoredItemNotificationEventArgs e)
    {
        if (e.NotificationValue is not MonitoredItemNotification notification)
            return;

        if(notification.Value.WrappedValue.TypeInfo.BuiltInType == BuiltInType.Boolean)
        {
            _memoryCache.Set(
                monitoredItem.DisplayName, 
                new AggregationTag(
                    (bool)notification.Value.WrappedValue.Value == true ? 1 : 0,
                    notification.Value.StatusCode.Code,
                    notification.Value.SourceTimestamp
                )
            );
            return;
        }

        _memoryCache.Set(monitoredItem.DisplayName, new AggregationTag(notification.Value.WrappedValue.Value, notification.Value.StatusCode.Code, notification.Value.SourceTimestamp));
    }
}
