# Cloud Brain

Cloud Brain is the hosted control plane for Sentry. It serves the React dashboard, exposes the authenticated REST API, enrolls agents, stores machine/project/package inventory, and shows heartbeat-backed machine status.

## Responsibilities

- Dashboard login and HTTP-only session handling.
- Open agent enrollment without a shared enrollment token.
- Machine, inventory, and heartbeat ingestion by machine id.
- Machine, project, package, and alert APIs.
- MongoDB persistence in production.
- Vercel-compatible HTTP realtime through agent heartbeats and dashboard polling.
- Optional WebSocket realtime when self-hosted as a long-running Express server.

## Deploying to Vercel

From the repository root, deploy the `cloud/` project to Vercel.

Required Vercel environment variables:

```bash
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=sentry
PUBLIC_CLOUD_URL=https://your-sentry-cloud.vercel.app
SENTRY_ADMIN_PASSWORD=<long admin password>
SENTRY_SESSION_SECRET=<long random session secret>
```

Recommended:

```bash
CLOUD_AUTH_REQUIRED=true
```

Vercel serves:

- Static dashboard assets from `cloud/public`.
- API routes through `cloud/api/index.js`.
- SPA fallback for route-based dashboard navigation.

Important: replace `https://your-sentry-cloud.vercel.app` in package defaults before publishing the npm packages.

## Local Development

```bash
npm install
npm run build
CLOUD_AUTH_REQUIRED=false npm start
```

Dashboard:

```text
http://127.0.0.1:4000
```

For public self-hosted testing on your LAN or VPS:

```bash
HOST=0.0.0.0 PORT=4000 PUBLIC_CLOUD_URL=http://<static-ip>:4000 npm start
```

For real public exposure, put HTTPS in front with Caddy, Nginx, Cloudflare Tunnel, or a similar reverse proxy and set `PUBLIC_CLOUD_URL` to the HTTPS URL.

## Authentication

Dashboard users authenticate with:

```http
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

The dashboard uses an HTTP-only session cookie. Protected dashboard APIs return `401` when unauthenticated.

Agent ingestion is open in v1. Agents identify themselves with machine metadata and a random session id returned during enrollment, but the Cloud Brain does not require bearer authorization for inventory or heartbeat uploads.

## Enrollment

Endpoint:

```http
POST /api/agents/enroll
```

Request:

```json
{
  "machine": {
    "machine_id": "generated-machine-id",
    "hostname": "DESKTOP-123",
    "os": "win32",
    "arch": "x64"
  },
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

## Agent APIs

Agent-facing endpoints accept machine metadata directly:

```http
POST /register
POST /project-inventory
POST /api/agents/heartbeat
```

Dashboard-facing agent administration requires dashboard session auth:

```http
GET /api/agents
GET /api/agents/me
POST /api/agents/:id/revoke
```

## Dashboard APIs

Protected dashboard reads:

```http
GET /state
GET /machines
GET /projects
GET /inventory
GET /alerts
```

Protected dashboard mutations:

```http
POST /alerts/:id/ack
POST /alerts/:id/remediate
POST /scan-machine/:id
POST /ingest-now
```

The React app consumes endpoint-specific API modules instead of relying on `/state` as the main page data source. `/state` remains available for compatibility and fallback hydration.

## Realtime Model

Vercel v1:

- Agents send `POST /api/agents/heartbeat` every fifteen seconds by default.
- Dashboard pages poll/refresh to show current data.
- Machine online/offline state is derived from recent authenticated heartbeat timestamps.

Self-hosted long-running server:

- WebSockets can be enabled for dashboard/agent realtime.
- Agent WebSocket connections require `role=agent` and `machine_id`.
- Dashboard WebSocket connections require a valid session cookie.

## Build and Verify

```bash
npm run build
node --check server.js
node --check api/index.js
npm audit
```

## Security Notes

- Do not disable auth on public deployments.
- Use a long random value for `SENTRY_SESSION_SECRET`.
- Store MongoDB credentials only in Vercel/environment config.
- Revoke a machine id if a machine is lost, retired, or compromised.
- Because ingestion is open, any client that can reach the API can submit machine/package data. Use reverse-proxy controls, IP allowlists, or reintroduce enrollment tokens if abuse becomes a concern.
