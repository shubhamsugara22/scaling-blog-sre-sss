---
title: "systemd RestartSec vs StartLimitInterval/StartLimitBurst"
date: "2025-09-07"
summary: "Avoid crash loops by tuning both restart delay and rate limiting."
tags: ["systemd", "til"]
---

Understanding systemd restart behavior is crucial for preventing crash loops and ensuring service reliability.

## Key Parameters

- **`RestartSec`**: Delay between restarts (default: 100ms)
- **`StartLimitInterval`**: Time window for counting restart attempts
- **`StartLimitBurst`**: Maximum restarts allowed within the interval

## How They Work Together

```ini
[Service]
Restart=on-failure
RestartSec=5s
StartLimitInterval=60s
StartLimitBurst=3
```

This configuration means:
- Wait 5 seconds between restart attempts
- Allow maximum 3 restarts within a 60-second window
- If limit is exceeded, the service enters a failed state

## Example: Preventing Crash Loops

### Bad Configuration (Rapid Crash Loop)

```ini
[Service]
Restart=always
RestartSec=0
# No rate limiting - will restart immediately forever
```

### Good Configuration (Controlled Restarts)

```ini
[Service]
Restart=on-failure
RestartSec=10s
StartLimitInterval=300s
StartLimitBurst=5
```

This allows 5 restart attempts over 5 minutes with 10-second delays, preventing rapid crash loops while still providing resilience.

## Checking Restart Status

```bash
# View service status and restart count
systemctl status myservice

# Reset failed state
systemctl reset-failed myservice

# View detailed service properties
systemctl show myservice | grep -E 'Restart|StartLimit'
```

## Best Practices

1. **Always set `RestartSec`** to at least 5-10 seconds for production services
2. **Use rate limiting** with `StartLimitInterval` and `StartLimitBurst`
3. **Choose appropriate `Restart` policy**: `on-failure` is usually better than `always`
4. **Monitor restart counts** to detect recurring issues

This prevents services from consuming resources in tight crash loops while maintaining automatic recovery capabilities.
