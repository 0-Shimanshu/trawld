# `@wahid7852/sentry-agent`

`@wahid7852/sentry-agent` is the primary customer-facing package. Users install it globally, enroll the current machine with your Cloud Brain, choose watched folders, and let the agent passively discover and export package inventory.

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
- Asks for the enrollment token.
- Calls `POST /api/agents/enroll`.
- Stores the returned per-agent token locally.
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
sentry-agent enroll --cloud https://your-cloud.example.com --token <enrollment-token>
sentry-agent start
sentry-agent status
sentry-agent config
sentry-agent config set-token <agent-token>
sentry-agent config set-cloud-http https://your-cloud.example.com
sentry-agent install-service
sentry-agent uninstall-service
```

## Config

The config is root-based rather than demo-project based:

```json
{
  "machineId": "machine-generated-on-first-run",
  "cloud": {
    "http": "https://your-sentry-cloud.vercel.app",
    "ws": "",
    "agentToken": "per-agent-token-from-enrollment"
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

## Enrollment Token Guide

The enrollment token is a shared invite token controlled by the Cloud Brain owner.

Cloud owner:

```bash
SENTRY_ENROLLMENT_TOKEN=<long-random-token>
```

End user:

```bash
sentry-agent setup
```

or non-interactive:

```bash
sentry-agent enroll --cloud https://your-sentry-cloud.vercel.app --token <enrollment-token>
```

Flow:

1. The agent sends machine metadata plus the enrollment token to `/api/agents/enroll`.
2. The Cloud Brain validates the token against `SENTRY_ENROLLMENT_TOKEN`.
3. The Cloud Brain generates a unique per-agent token.
4. The agent stores that per-agent token in local config.
5. Future exports use `Authorization: Bearer <agentToken>`.

Operationally, this means:

- Rotate `SENTRY_ENROLLMENT_TOKEN` when you want to stop new machines from joining.
- Existing machines keep working because they use per-agent tokens.
- Revoke one machine from the dashboard/API when only that machine should stop reporting.
- Do not publish the enrollment token in npm packages, source code, screenshots, or public docs.

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
- Authenticated inventory export after scans.
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
- Agent token is present.
- Cloud auth succeeds.
- Watched roots exist.
- Last export time is recent.
- Heartbeats are reaching the dashboard.

Common issues:

- `401` during setup: the enrollment token is wrong or the Cloud Brain env var changed.
- `401` after setup: the per-agent token is missing, revoked, or copied incorrectly.
- No projects discovered: watched roots are too narrow or ignored by pattern.
- Dashboard offline: heartbeat loop is not running or the Cloud URL is unreachable.
