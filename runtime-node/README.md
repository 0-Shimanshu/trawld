# `@wahid7852/sentry-runtime-node`

`@wahid7852/sentry-runtime-node` is the optional Node.js runtime enhancer for Sentry. It is not the main install path. Most users only need the global `@wahid7852/sentry-agent` package.

Use this package when a Node app should report process-aware runtime data to the local agent.

## Install

```bash
npm install @wahid7852/sentry-runtime-node
```

For local repository testing, install the package from this folder into a private scratch app with `npm install <path-to-runtime-node>`.

## Usage

Add the hook as the first import in your app entrypoint:

```js
import "@wahid7852/sentry-runtime-node";
```

The first import registers automatically unless disabled.

What it does:

- Detects the current project root.
- Reads npm package metadata and lockfile data.
- Builds a registration payload.
- Sends runtime registration to the local Sentry agent on `127.0.0.1:7654`.
- Reports runtime events through the local agent.

The hook does not talk directly to the Cloud Brain. Cloud export remains the local agent's job.

## Named API

```js
import {
  buildRegistrationPayload,
  collectProjectInventory,
  configureRuntimeHook,
  registerProjectHook,
  reportEvent
} from "@wahid7852/sentry-runtime-node";
```

Available exports:

- `configureRuntimeHook(options)`: override local agent URL, project root, app label, or auto-registration behavior.
- `collectProjectInventory(projectRoot)`: collect npm package inventory for a project.
- `buildRegistrationPayload(options)`: build the payload sent to the local agent.
- `registerProjectHook(options)`: manually register with the local agent.
- `reportEvent(event)`: send a runtime event to the local agent.

The package also provides a default export containing the public API.

## Environment Variables

```bash
VULNPKG_AGENT_URL=http://127.0.0.1:7654
VULNPKG_PROJECT_ROOT=C:\path\to\project
VULNPKG_APP_LABEL=my-api
VULNPKG_DISABLE_AUTO_REGISTER=1
```

Defaults:

- `VULNPKG_AGENT_URL`: `http://127.0.0.1:7654`
- `VULNPKG_PROJECT_ROOT`: detected from the current working directory
- `VULNPKG_APP_LABEL`: package name or folder name
- `VULNPKG_DISABLE_AUTO_REGISTER`: auto-register is enabled unless set to `1`

## Relationship to the Agent

The runtime hook is an enhancer:

- Agent-only install: machine, project, package inventory, heartbeats, and alerts.
- Agent plus runtime hook: adds PID-aware registration and process/runtime context.

The agent setup wizard can optionally install this package into detected Node projects, but it does not silently edit source files. Users still add the import themselves.

## Package Contract

This is an ESM-only package. Use modern Node.js and `import` syntax.

Before publishing:

```bash
npm pack --dry-run
```

Confirm the package contains only:

- `index.js`
- `README.md`
- `package.json`
