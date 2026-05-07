# Dashboard Guide

The Sentry dashboard is now documented as part of the Cloud Brain component.

Start here:

- [Main README](README.md)
- [Cloud Brain README](cloud/README.md)
- [Agent README](agent/README.md)

## Current Dashboard Model

- Route-based React app with pages for `/`, `/machines`, `/machines/:machineId`, `/alerts`, `/packages`, and `/analytics`.
- Authenticated dashboard session through `POST /api/auth/login`.
- Endpoint-specific reads from `/machines`, `/projects`, `/inventory`, and `/alerts`.
- Global shell with refresh, sync actions, compact fleet counters, and realtime status.
- Vercel-compatible realtime through HTTP heartbeats plus polling.
- Optional WebSocket realtime for self-hosted long-running Express mode.

For deployment, authentication, enrollment, and API details, use [cloud/README.md](cloud/README.md).
