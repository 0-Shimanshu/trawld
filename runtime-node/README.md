# `@wahid7852/trawld-runtime-node`

Optional Node.js runtime hook for trawld. Most users only need `@wahid7852/trawld-agent`. Use this package when you want process-aware runtime data reported alongside the passive package inventory.

## Install

```bash
npm install @wahid7852/trawld-runtime-node
```

## Usage

Add as the first import in your app entrypoint:

```js
import "@wahid7852/trawld-runtime-node";
```

The hook registers automatically on import. It detects the project root, reads package metadata, and sends a registration payload to the local agent on `127.0.0.1:7654`. The hook does not talk directly to the Cloud Brain.

## Named API

```js
import {
  buildRegistrationPayload,
  collectProjectInventory,
  configureRuntimeHook,
  registerProjectHook,
  reportEvent
} from "@wahid7852/trawld-runtime-node";
```

- `configureRuntimeHook(options)` - override agent URL, project root, app label, or disable auto-registration
- `collectProjectInventory(projectRoot)` - collect npm package inventory for a project
- `buildRegistrationPayload(options)` - build the payload sent to the local agent
- `registerProjectHook(options)` - manually register with the local agent
- `reportEvent(event)` - send a runtime event to the local agent

## Environment Variables

```bash
VULNPKG_AGENT_URL=http://127.0.0.1:7654
VULNPKG_PROJECT_ROOT=C:\path\to\project
VULNPKG_APP_LABEL=my-api
VULNPKG_DISABLE_AUTO_REGISTER=1
```

## Relationship to the Agent

- Agent only: machine, projects, packages, heartbeats, vulnerability alerts
- Agent + runtime hook: adds PID-aware process registration and runtime context

The `trawld setup` wizard can optionally install this package into detected Node projects. It does not edit your source files - you add the import yourself.

## Notes

ESM-only package. Requires Node.js 18+.

```bash
npm pack --dry-run
```

Confirm the package contains only `index.js`, `README.md`, and `package.json` before publishing.
