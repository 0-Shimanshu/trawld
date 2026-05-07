# Future Access Control Notes

The current v1 Cloud Brain is intentionally open: no dashboard users, no admin password, no session cookies, and no enrollment token.

Current model:

- Anyone with the Cloud Brain URL can view dashboard data.
- Agents register machine sessions without a shared enrollment token.
- Ingestion and heartbeat APIs are open by machine id.
- Machine revocation blocks a known machine id from continuing to report.

Future access-control options can build on this foundation:

- Reverse-proxy IP allowlists.
- Private networking or VPN-only deployments.
- Per-team enrollment links or invite tokens.
- Multiple dashboard users and organization scoping.
- Audit logs and role-based permissions.

For the current deployed contract, see [README.md](../README.md) and [cloud/README.md](README.md).
