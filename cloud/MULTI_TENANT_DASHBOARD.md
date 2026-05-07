# Dashboard Authentication Notes

The current v1 Cloud Brain uses a single-admin dashboard login plus agent enrollment tokens. It is not a full multi-tenant user-management system yet.

Current auth model:

- `SENTRY_ADMIN_PASSWORD` protects dashboard login.
- `SENTRY_SESSION_SECRET` signs HTTP-only dashboard sessions.
- `SENTRY_ENROLLMENT_TOKEN` lets new agents request their own per-agent credential.
- Per-agent bearer tokens protect ingestion and heartbeat APIs.

Planned multi-tenant features can build on this foundation:

- Multiple dashboard users.
- Organization/team scoping.
- Role-based permissions.
- Audit logs.
- Per-team enrollment tokens.
- Token expiry and rotation workflows.

For the current deployed contract, see [README.md](../README.md) and [cloud/README.md](README.md).
