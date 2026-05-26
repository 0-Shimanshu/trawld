# `@wahid7852/trawld-agent`

The primary package. Install globally on any machine you want to monitor, run setup, and the agent starts watching your project folders and reporting to the dashboard.

No code changes to your apps required.

## Install

```bash
npm install -g @wahid7852/trawld-agent
trawld setup
```

## What Setup Does

`trawld setup` walks you through onboarding:

- Connects to your Cloud Brain (defaults to the hosted URL)
- Calls `POST /api/agents/enroll` and stores the returned session ID
- Asks which project folders to watch
- Optionally configures Windows startup
- Detects Node projects and optionally installs `@wahid7852/trawld-runtime-node`

## Commands

```bash
trawld setup
trawld setup --cloud https://your-cloud.vercel.app
trawld enroll --cloud https://your-cloud.vercel.app
trawld start
trawld status
trawld config
trawld config path
trawld config add-watch-root <path>
trawld config remove-watch-root <path>
trawld config set-cloud-http <url>
trawld config set-cloud-ws <url>
trawld config set-session <session-id>
trawld install-service
trawld uninstall-service
```

## Config

```json
{
  "machineId": "generated-on-first-run",
  "cloud": {
    "http": "https://trawld-dashboard.vercel.app",
    "ws": "",
    "agentSessionId": "returned-by-cloud"
  },
  "watchRoots": [
    "C:\\Users\\you\\Desktop\\projects"
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
  }
}
```

## How Enrollment Works

Open enrollment - no shared token required:

1. Agent sends machine metadata to `/api/agents/enroll`
2. Cloud Brain creates or updates the enrolled-agent record
3. Cloud Brain returns a random session ID
4. Agent stores the session ID locally
5. All future payloads (inventory, heartbeat) include machine ID

If a machine is lost or should stop reporting, revoke its ID from the dashboard.

## Passive Discovery

The agent scans watched roots for supported manifest files:

- npm: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- PyPI: `requirements.txt`, `pyproject.toml`

Users pick explicit roots (e.g. `C:\Users\you\projects`) - no whole-disk scanning.

## Automatic Behaviour

Once running, the agent:

- Rescans watched roots on startup
- Watches for manifest file changes
- Rescans every 5 minutes by default
- Sends heartbeats every 15 seconds (jittered)
- Skips unchanged project snapshots (hash deduplication)
- Listens for optional runtime hooks on `127.0.0.1:7654`

## Windows Startup

```bash
trawld install-service
trawld uninstall-service
```

Use `trawld start` for foreground testing before installing the background task.

## Troubleshooting

```bash
trawld status
```

Checks: machine ID, cloud URL, session ID, cloud reachability, watched roots, last export time, heartbeat status.

Common issues:
- `403` after setup: machine ID was revoked from the dashboard
- Dashboard shows offline: heartbeat loop stopped or Cloud URL unreachable
- No projects discovered: watched roots too narrow or excluded by ignore patterns
