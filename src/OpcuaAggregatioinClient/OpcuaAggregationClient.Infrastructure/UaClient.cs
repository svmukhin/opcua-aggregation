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
    private IEnumerable<UaClientChannelConfiguration>? _subscribedItems;
    private bool _disposed;
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
    public int ReconnectPeriod { get; set; } = 15000;
    public int ReconnectPeriodExponentialBackoff { get; set; } = 15000;
    public uint SessionLifeTime { get; set; } = 60000;
    public IUserIdentity UserIdentity { get; set; } = new UserIdentity();
    public bool AutoAccept { get; set; } = false;

    public async Task<bool> ConnectAsync(string serverUrl, bool useSecurity = false)
    {
        if(_disposed) throw new ObjectDisposedException(nameof(UaClient));
        ArgumentNullException.ThrowIfNull(serverUrl);

        try
        {
            if (_session != null && _session.Connected == true)
            {
                _logger.LogInformation("Session already connected!");
            }
            else
            {
                _logger.LogInformation("Connecting to... {SessionName} with {serverUrl}",_uaClientConfiguration.SessionName, serverUrl);
                ITransportWaitingConnection? connection = null;
                EndpointDescription endpointDescription = CoreClientUtils.SelectEndpoint(_configuration, serverUrl, useSecurity);
                EndpointConfiguration endpointConfiguration = EndpointConfiguration.Create(_configuration);
                ConfiguredEndpoint endpoint = new(null, endpointDescription, endpointConfiguration);

                var sessionFactory = TraceableSessionFactory.Instance;

                var session = await sessionFactory.CreateAsync(
                    _configuration,
                    connection,
                    endpoint,
                    connection == null,
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
                    _session.DeleteSubscriptionsOnClose = false;
                    _session.TransferSubscriptionsOnReconnect = true;
                    _session.KeepAlive += OnKeepAlive;
                    _reconnectHandler = new SessionReconnectHandler(true, ReconnectPeriodExponentialBackoff);
                    _logger.LogInformation("New Session Created with Name: {SessionName}, Id: {Id}", _session.SessionName, session.SessionId);
                    _memoryCache.Set($"{_session.SessionName}.connectError", new AggregationTag(0, 0, DateTime.UtcNow));
                }
                else
                {
                    _memoryCache.Set($"{_uaClientConfiguration.SessionName}.connectError", new AggregationTag(0, 0, DateTime.UtcNow));

                }
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError("Create Session Error : {Message}", ex.Message);
            _memoryCache.Set($"{_uaClientConfiguration.SessionName}.connectError", new AggregationTag(1, 0, DateTime.UtcNow));
            return false;
        }
    }

    public async Task Disconnect(bool leaveChannelOpen = false, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_session != null)
            {
                _logger.LogInformation("Disconnecting...");

                lock(_lock)
                {
                    _session.KeepAlive -= OnKeepAlive;
                    _reconnectHandler?.Dispose();
                    _reconnectHandler = null;
                }

                await _session.CloseAsync(cancellationToken);
                if(leaveChannelOpen)
                {
                    _session.DetachChannel();
                }
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
        _disposed = true;
        Utils.SilentDispose(_session);
        _configuration.CertificateValidator.CertificateValidation -= CertificateValidation;
        GC.SuppressFinalize(this);
    }

    private void OnKeepAlive(ISession session, KeepAliveEventArgs e)
    {
        try
        {
            if (!_session!.Equals(Session))
            {
                _logger.LogWarning("OnKeepAlive from discarded session! Session Name: {name}, Id: {Id}", session.SessionName, session.SessionId);
                return;
            }

            if (ServiceResult.IsBad(e.Status))
            {
                if (ReconnectPeriod <= 0)
                {
                    _logger.LogWarning("Session {SessionName}: KeepAlive status {Status}, but reconnect is disabled.", _session.SessionName, e.Status);
                    return;
                }

                var state = _reconnectHandler?.BeginReconnect(_session, ReconnectPeriod, OnReconnectCompleted);
                if (state == SessionReconnectHandler.ReconnectState.Triggered)
                {
                    _logger.LogWarning("Session {SessionName}: KeepAlive status {status}, reconnect status {state}, reconnect period {ReconnectPeriod}ms.",_session.SessionName, e.Status, state, ReconnectPeriod);
                }
                else
                {
                    _logger.LogWarning("Session {SessionName}: KeepAlive status {status}, reconnect status {state}.", _session.SessionName, e.Status, state);
                }

                // cancel sending a new keep alive request, because reconnect is triggered.
                e.CancelKeepAlive = true;

                _memoryCache.Set($"{_session.SessionName}.connectError", new AggregationTag(1, 0, DateTime.UtcNow));
                if (_subscribedItems is null)
                {
                    return;
                }
                foreach (var item in _subscribedItems)
                {
                    var key = $"{_session.SessionName}.{item.NodeId}";
                    if (_memoryCache.TryGetValue(key, out AggregationTag? tag))
                    {
                        if (tag is null)
                        {
                            continue;
                        }
                        _memoryCache.Set(key, new AggregationTag(tag.Value, 1, tag.Timestamp));
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
            // if session recovered, Session property is null
            if (_reconnectHandler?.Session != null)
            {
                // ensure only a new instance is disposed
                // after reactivate, the same session instance may be returned
                if (!Object.ReferenceEquals(_session, _reconnectHandler.Session))
                {
                    _logger.LogInformation("Session {SessionName}: --- RECONNECTED TO NEW SESSION --- {0}", _reconnectHandler.Session.SessionName,  _reconnectHandler.Session.SessionId);
                    var session = _session;
                    _session = _reconnectHandler.Session;
                    Utils.SilentDispose(session);
                }
                else
                {
                    _logger.LogInformation("Session {SessionName}: --- REACTIVATED SESSION --- {0}", _reconnectHandler.Session.SessionName, _reconnectHandler.Session.SessionId);
                }
            }
            else
            {
                _logger.LogInformation("Session {SessionName}: --- RECONNECT KeepAlive recovered ---", _session?.SessionName);
            }            

            _memoryCache.Set($"{_session?.SessionName}.connectError", new AggregationTag(0, 0, DateTime.UtcNow));
        }
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

    public async Task AddSubscription(IEnumerable<UaClientChannelConfiguration> items, string subscriptionName = "default")
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
                PublishingInterval = _publishingInterval,
                LifetimeCount = 60,
                KeepAliveCount = 2,
                DisableMonitoredItemCache = true,
                MaxNotificationsPerPublish = 1000,
                MinLifetimeInterval = (uint)_session.SessionTimeout,
                FastDataChangeCallback = FastDataChangeNotification,
            };

            _session.AddSubscription(subscription);
            await subscription.CreateAsync().ConfigureAwait(false);

            foreach (var item in items)
            {
                var displayName = $"{subscriptionName}.{item.NodeId}";
                MonitoredItem monitoredItem = new(subscription.DefaultItem)
                {
                    StartNodeId = new NodeId(item.NodeId),
                    AttributeId = Attributes.Value,
                    DisplayName = displayName,
                    SamplingInterval = _samplingInterval,
                    QueueSize = 1,
                    DiscardOldest = true,
                    MonitoringMode = MonitoringMode.Reporting,
                };
                subscription.AddItem(monitoredItem);
                _memoryCache.Set(displayName, new AggregationTag(0, 1, DateTime.UtcNow));
            }

            await subscription.ApplyChangesAsync().ConfigureAwait(false);

            _subscribedItems = items;
        }
        catch (Exception ex)
        {
            _logger.LogError("{Message}", ex.Message);
            throw;
        }
    }

    private void FastDataChangeNotification(Subscription subscription, DataChangeNotification dataChangeNotification, IList<string> stringTable)
    {
        try
        {
            foreach(var notification in dataChangeNotification.MonitoredItems)
            {
                var monitoredItem = subscription.MonitoredItems.FirstOrDefault(item => item.ClientHandle == notification.ClientHandle);
                if(monitoredItem == null)
                {
                    continue;
                }

                if(notification.Value.WrappedValue.TypeInfo.BuiltInType == BuiltInType.Boolean)
                {
                    _memoryCache.Set(
                        monitoredItem.DisplayName, 
                        new AggregationTag(
                            (bool)notification.Value.WrappedValue.Value == true ? 1 : 0,
                            notification.Value.StatusCode.Code == 0 ? 0 : 1,
                            notification.Value.SourceTimestamp
                        )
                    );
                    continue;
                }

                _memoryCache.Set(
                    monitoredItem.DisplayName, 
                    new AggregationTag(
                        notification.Value.WrappedValue.Value, 
                        notification.Value.StatusCode.Code == 0 ? 0 : 1, 
                        notification.Value.SourceTimestamp
                    )
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError("FastDataChangeNotification error: {0}", ex.Message);
        }
    }

    public UaClientStatus GetStatus()
    {
        var connectError = 1;
        if (_memoryCache.TryGetValue($"{_session?.SessionName}.connectError", out AggregationTag? tag))
        {
            if(tag is not null)
            {
                connectError = (int)tag.Value;
            }
        }
        return new UaClientStatus
        {
            Id = _uaClientConfiguration.Id!.Value,
            SessionName = _uaClientConfiguration.SessionName,
            ServerUri = _uaClientConfiguration.ServerUri,
            ConnectError = connectError,
            MonitoredItems = _subscribedItems?.Select(item => $"{_uaClientConfiguration.SessionName}.{item.NodeId}")
        };
    }
}
