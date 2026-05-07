# Dashboard Authentication Notes

The current v1 Cloud Brain uses a single-admin dashboard login plus open agent enrollment. It is not a full multi-tenant user-management system yet.

Current auth model:

- `SENTRY_ADMIN_PASSWORD` protects dashboard login.
- `SENTRY_SESSION_SECRET` signs HTTP-only dashboard sessions.
- Agents can register machine sessions without a shared enrollment token.
- Ingestion and heartbeat APIs are open by machine id in v1.

Planned multi-tenant features can build on this foundation:

- Multiple dashboard users.
- Organization/team scoping.
- Role-based permissions.
- Audit logs.
- Per-team enrollment links or invite tokens.
- Token expiry and rotation workflows.

For the current deployed contract, see [README.md](../README.md) and [cloud/README.md](README.md).
