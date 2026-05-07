# `@wahid7852/sentry-agent`

`@wahid7852/sentry-agent` is the primary customer-facing package. Users install it globally, register the current machine with your Cloud Brain, choose watched folders, and let the agent passively discover and export package inventory.

The agent is enough on its own. Users do not need to import anything into their apps unless they want the optional Node runtime hook.

## Install

```bash
npm install -g @wahid7852/sentry-agent
sentry-agent setup
```

The published package should default to your hosted Cloud Brain URL. In this repository, the placeholder must be replaced before publish:

```text
https://your-sentry-cloud.vercel.app
```

## What Setup Does

`sentry-agent setup` is the main onboarding command.

It:

- Shows the default hosted Cloud Brain URL and allows an advanced override.
- Calls `POST /api/agents/enroll`.
- Stores the returned random agent session id locally.
- Asks for watched project folders.
- Persists machine identity and config.
- Optionally configures Windows startup.
- Detects Node projects under watched roots.
- Optionally installs `@wahid7852/sentry-runtime-node` into selected Node projects.
- Prints the import line for runtime integration without editing app source files.

## Commands

```bash
sentry-agent setup
sentry-agent setup --cloud https://your-cloud.example.com
sentry-agent enroll --cloud https://your-cloud.example.com
sentry-agent start
sentry-agent status
sentry-agent config
sentry-agent config set-session <session-id>
sentry-agent config set-cloud-http https://your-cloud.example.com
sentry-agent install-service
sentry-agent uninstall-service
```

## Config

The config is root-based rather than project-entry based:

```json
{
  "machineId": "machine-generated-on-first-run",
  "cloud": {
    "http": "https://your-sentry-cloud.vercel.app",
    "ws": "",
    "agentSessionId": "random-session-id-from-cloud"
  },
  "watchRoots": [
    "C:\\Users\\you\\Desktop\\projects",
    "C:\\Users\\you\\source"
  ],
  "ignorePatterns": [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**"
  ],
  "automation": {
    "heartbeatIntervalMs": 15000,
    "rescanIntervalMs": 300000,
    "rescanOnStart": true,
    "manifestWatch": true
  },
  "policy": {
    "critical": "kill",
    "high": "block",
    "medium": "alert",
    "low": "log"
  }
}
```

Existing `monitoredProjects` configs remain supported as a migration path, but new installs should use `watchRoots`.

## Open Enrollment Guide

The agent uses open enrollment in v1. There is no shared enrollment token and no bearer-token authorization requirement for machine/package uploads.

End user:

```bash
sentry-agent setup
```

or non-interactive:

```bash
sentry-agent enroll --cloud https://your-sentry-cloud.vercel.app
```

Flow:

1. The agent sends machine metadata to `/api/agents/enroll`.
2. The Cloud Brain creates or updates an enrolled-agent record.
3. The Cloud Brain returns a random agent session id.
4. The agent stores that session id in local config.
5. Future exports send machine id, project, package, and heartbeat payloads directly to the Cloud Brain.

Operationally, this means:

- Setup is simpler because users only need the Cloud Brain URL and watched roots.
- Public Cloud Brain ingestion is writable by anyone who can reach the API.
- Revoke one machine id from the dashboard/API when that machine should stop reporting.
- If abuse becomes a concern, add invite tokens, signed enrollment links, IP allowlists, or per-user accounts later.

## Passive Discovery

The agent discovers projects by scanning configured roots for supported manifest files.

Supported ecosystems in v1:

- npm: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- PyPI: `requirements.txt`, `pyproject.toml`

The agent avoids broad whole-disk scanning. Users explicitly choose roots such as:

```text
C:\Users\you\Desktop\projects
C:\Users\you\source
D:\client-work
```

## Automation

After setup, the agent can run as a foreground process or Windows startup task/service.

Automatic behavior:

- Startup rescan of watched roots.
- Manifest-change rescans.
- Scheduled rescans every five minutes by default.
- Inventory export after scans.
- HTTP heartbeat every fifteen seconds by default.
- Local runtime-hook listener on `127.0.0.1:7654`.

Heartbeat payloads let the Vercel-hosted dashboard show online/offline state without relying on long-running hosted WebSockets.

## Optional Runtime Integration

During setup, the agent can detect Node projects and ask whether to install the optional hook.

If accepted, it installs:

```bash
npm install @wahid7852/sentry-runtime-node
```

or uses pnpm/yarn when a matching lockfile exists. It does not edit application entry files. Users should add:

```js
import "@wahid7852/sentry-runtime-node";
```

as the first import when they want PID-aware runtime telemetry.

## Windows Startup

Windows is the first-class background target for v1.

```bash
sentry-agent install-service
sentry-agent uninstall-service
```

Use `sentry-agent start` for foreground debugging before installing background startup.

## Status and Troubleshooting

```bash
sentry-agent status
```

Check:

- Machine ID exists.
- Cloud HTTP URL is correct.
- Agent session id is present.
- Cloud status endpoint succeeds.
- Watched roots exist.
- Last export time is recent.
- Heartbeats are reaching the dashboard.

Common issues:

- `403` after setup: the machine id was revoked by the Cloud Brain.
- Dashboard offline: heartbeat loop is not running or the Cloud URL is unreachable.
- No projects discovered: watched roots are too narrow or ignored by pattern.
