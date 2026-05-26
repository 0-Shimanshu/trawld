# Cloud Brain

The hosted control plane for trawld. Serves the React dashboard, accepts agent telemetry, stores machine/project/package inventory, queries OSV for vulnerabilities, and shows heartbeat-backed online/offline status.

## Responsibilities

- Open dashboard with no login
- Open agent enrollment without a shared token
- Machine, inventory, and heartbeat ingestion by machine ID
- Snapshot deduplication by `machine_id`, `project_id`, `snapshot_hash`
- MongoDB persistence for machines, projects, packages, alerts, agents, snapshots, CVEs, OSV cache
- Vercel-compatible realtime via HTTP heartbeats + adaptive polling
- Optional WebSocket realtime for self-hosted Express deployments

## Deploying to Vercel

Deploy the `cloud/` directory as a Vercel project.

Required environment variables:

```bash
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=trawld
PUBLIC_CLOUD_URL=https://trawld-dashboard.vercel.app
```

Optional:

```bash
OSV_QUERY_CACHE_TTL_MS=86400000
REALTIME_MODE=http
```

## Local Development

```bash
npm install
npm run build
npm start
```

Dashboard: `http://127.0.0.1:4000`

For LAN/VPS testing:

```bash
HOST=0.0.0.0 PORT=4000 PUBLIC_CLOUD_URL=http://<ip>:4000 npm start
```

## Agent Enrollment

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
  "agentSessionId": "random-session-id",
  "agent": { "machine_id": "...", "hostname": "DESKTOP-123", "revoked": false }
}
```

The session ID is a correlation value, not an auth secret.

## API Reference

Agent-facing:

```http
POST /register
POST /project-inventory
POST /project-inventory-batch
POST /inventory
POST /api/agents/heartbeat
GET  /api/agents/me?machine_id=<id>
```

Dashboard/system:

```http
GET  /api/system/info
GET  /api/agents
POST /api/agents/:id/revoke
GET  /state
GET  /machines
GET  /projects
GET  /inventory
GET  /alerts
POST /alerts/:id/ack
POST /alerts/:id/remediate
POST /scan-machine/:id
POST /scan-project/:id
POST /ingest-now
```

## Performance

- Agents skip unchanged snapshots locally before uploading
- Cloud ignores repeated snapshots with the same project hash
- OSV query results cached in memory + MongoDB with TTL
- Heartbeats are jittered to avoid synchronized spikes
- Vercel mode uses adaptive polling: fast after changes, slow when idle

## Build & Verify

```bash
npm run build
node --check server.js
node --check api/index.js
npm audit
```

## Deployment Notes

- Anyone with the URL can view dashboard data and submit telemetry
- Treat public Cloud Brain URLs as writable ingestion endpoints
- Revoke a machine ID from the dashboard if a machine is lost or retired
- Use reverse-proxy controls or IP allowlists for access restrictions
