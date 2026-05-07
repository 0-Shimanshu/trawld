# Cloud Brain

Cloud Brain is the open coordination service for Sentry. It serves the React dashboard, accepts agent telemetry, stores machine/project/package inventory, queries OSV, and shows heartbeat-backed machine status from the same frontend/backend deployment.

## Responsibilities

- Open dashboard and REST APIs with no admin login.
- Open agent enrollment without a shared enrollment token.
- Machine, inventory, and heartbeat ingestion by machine id.
- Snapshot dedupe using `machine_id`, `project_id`, and `snapshot_hash`.
- MongoDB persistence for machines, projects, packages, alerts, agents, snapshots, CVEs, and OSV package-query cache.
- Vercel-compatible realtime through agent heartbeats plus adaptive dashboard polling.
- Optional WebSocket realtime when self-hosted as a long-running Express server.

## Deploying to Vercel

From the repository root, deploy the `cloud/` project to Vercel.

Required Vercel environment variables:

```bash
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=sentry
PUBLIC_CLOUD_URL=https://your-sentry-cloud.vercel.app
```

Optional:

```bash
OSV_QUERY_CACHE_TTL_MS=86400000
REALTIME_MODE=http
```

Vercel serves static dashboard assets from `cloud/public`, API routes through `cloud/api/index.js`, and SPA fallback for route-based navigation. Replace `https://your-sentry-cloud.vercel.app` in package defaults before publishing npm packages.

## Local Development

```bash
npm install
npm run build
npm start
```

Dashboard:

```text
http://127.0.0.1:4000
```

For public self-hosted testing on your LAN or VPS:

```bash
HOST=0.0.0.0 PORT=4000 PUBLIC_CLOUD_URL=http://<static-ip>:4000 npm start
```

For HTTPS, put Caddy, Nginx, Cloudflare Tunnel, or another reverse proxy in front and set `PUBLIC_CLOUD_URL` to the public URL.

## Agent Enrollment

Endpoint:

```http
POST /api/agents/enroll
```

Request:

```json
{
  "machine_id": "generated-machine-id",
  "hostname": "DESKTOP-123",
  "os": "win32",
  "label": "Wahid laptop"
}
```

Response:

```json
{
  "agentSessionId": "random-agent-session-id",
  "agent": {
    "machine_id": "generated-machine-id",
    "hostname": "DESKTOP-123",
    "revoked": false
  }
}
```

The session id is a local correlation value, not an authorization secret.

## Public APIs

Agent-facing endpoints:

```http
POST /register
POST /project-inventory
POST /project-inventory-batch
POST /inventory
POST /api/agents/heartbeat
GET /api/agents/me?machine_id=<id>
```

Dashboard/system endpoints:

```http
GET /api/system/info
GET /api/agents
POST /api/agents/:id/revoke
GET /state
GET /machines
GET /projects
GET /inventory
GET /alerts
POST /alerts/:id/ack
POST /alerts/:id/remediate
POST /scan-machine/:id
POST /scan-project/:id
POST /ingest-now
```

Responses include `state_version` and `last_updated` where useful. The dashboard polls `/api/system/info` and refreshes heavier datasets only when the state version changes.

## Performance Model

- Agents skip unchanged project snapshots locally when the hash has not changed.
- Root discovery uploads changed project snapshots in batches.
- Cloud Brain ignores repeated snapshots with the same project hash before OSV evaluation.
- OSV package query results are cached in memory and persisted to MongoDB with a TTL.
- Heartbeats include jitter to prevent many agents from reporting at exactly the same interval.
- Vercel mode uses adaptive polling: faster after changes, slower when idle.

## Build and Verify

```bash
npm run build
node --check server.js
node --check api/index.js
npm audit
```

## Open Deployment Notes

- Anyone with the URL can view dashboard data and submit telemetry.
- Hostnames, OS names, project paths, and package inventories should be treated as public to that deployment.
- Use reverse-proxy controls, private networking, or IP allowlists if you need access restrictions later.
- Revoke a machine id if a machine is lost, retired, or should stop reporting.
