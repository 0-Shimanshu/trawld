# Victim App

`victim-app` is an optional local demo project. It intentionally depends on a vulnerable lodash version so the Cloud Brain, agent discovery, alerting, and optional runtime hook can be tested end to end.

Do not use this app as a default monitored project in production. New agent installs should configure their own watched roots through:

```bash
sentry-agent setup
```

## Run the Demo

Start the Cloud Brain and agent first, then:

```bash
cd victim-app
npm install
node index.js
```

The app imports the local runtime package through the package entrypoint:

```js
import "@wahid7852/sentry-runtime-node";
```

Expected behavior:

- The runtime hook registers with the local agent.
- The agent discovers/export package inventory.
- The dashboard receives the vulnerable lodash package.
- Policy-driven enforcement may alert, block, or terminate depending on agent config.

## Intentional Audit Finding

This sample keeps `lodash@4.17.15` on purpose. `npm audit` in this folder should report a high-severity lodash issue. That is demo data, not a production dependency.
