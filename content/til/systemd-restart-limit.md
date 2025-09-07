---
title: "systemd RestartSec vs StartLimitInterval/StartLimitBurst"
date: "2025-09-07"
summary: "Avoid crash loops by tuning both restart delay and rate limiting."
tags: ["systemd", "til"]
---
- `RestartSec`: delay between restarts
- `StartLimitInterval` + `StartLimitBurst`: rate limit restarts within a window