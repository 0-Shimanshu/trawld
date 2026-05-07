# Cloud Brain

Cloud Brain is the hosted control plane for Sentry. It serves the React dashboard, exposes the authenticated REST API, enrolls agents, stores machine/project/package inventory, and shows heartbeat-backed machine status.

## Responsibilities

- Dashboard login and HTTP-only session handling.
- Agent enrollment with a shared enrollment token.
- Per-agent token validation for ingestion and heartbeats.
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
SENTRY_ENROLLMENT_TOKEN=<long random enrollment token>
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

Agent ingestion uses bearer tokens:

```http
Authorization: Bearer <agentToken>
```

The agent token is created only after successful enrollment.

## Enrollment

Endpoint:

```http
POST /api/agents/enroll
```

Request:

```json
{
  "enrollmentToken": "shared-cloud-owner-token",
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
  "agentToken": "generated-per-agent-token",
  "agent": {
    "machine_id": "generated-machine-id",
    "hostname": "DESKTOP-123",
    "revoked": false
  }
}
```

The enrollment token is only used to create a new agent credential. After that, the agent uses its own per-agent token.

## Agent APIs

Agent-facing endpoints require a valid per-agent bearer token:

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
- Agent WebSocket connections require `role=agent`, `machine_id`, and `token`.
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
- Use long random values for `SENTRY_SESSION_SECRET` and `SENTRY_ENROLLMENT_TOKEN`.
- Store MongoDB credentials only in Vercel/environment config.
- Rotate the enrollment token if it leaks.
- Revoke an agent token if a machine is lost, retired, or compromised.
