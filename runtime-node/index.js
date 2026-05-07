import crypto from "crypto";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const DEFAULT_AGENT_URL = process.env.VULNPKG_AGENT_URL || "http://127.0.0.1:7654";

let runtimeConfig = {
  agentUrl: DEFAULT_AGENT_URL,
  projectRoot: process.env.VULNPKG_PROJECT_ROOT || process.cwd(),
  appLabel: process.env.VULNPKG_APP_LABEL || "",
  autoRegister: process.env.VULNPKG_DISABLE_AUTO_REGISTER !== "1"
};

function normalizeVersion(version) {
  if (!version) return "";
  return String(version)
    .trim()
    .replace(/^[=~^><\s]+/, "")
    .replace(/^[vV]/, "");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function dedupePackages(packages) {
  const seen = new Map();
  for (const pkg of packages) {
    if (!pkg?.name || !pkg?.version) continue;
    const key = `${pkg.ecosystem}:${pkg.name}@${pkg.version}`;
    seen.set(key, pkg);
  }
  return Array.from(seen.values()).sort((left, right) => {
    return `${left.ecosystem}:${left.name}@${left.version}`.localeCompare(
      `${right.ecosystem}:${right.name}@${right.version}`
    );
  });
}

function parsePackageJsonDependencies(packageJson) {
  const sections = [
    packageJson.dependencies || {},
    packageJson.devDependencies || {},
    packageJson.optionalDependencies || {},
    packageJson.peerDependencies || {}
  ];

  return dedupePackages(
    sections.flatMap((section) =>
      Object.entries(section).map(([name, version]) => ({
        ecosystem: "npm",
        name,
        version: normalizeVersion(version)
      }))
    )
  );
}

function parsePackageLock(projectRoot) {
  const lockPath = path.join(projectRoot, "package-lock.json");
  if (!fs.existsSync(lockPath)) return [];

  try {
    const json = readJson(lockPath);
    const packages = [];

    if (json.packages && typeof json.packages === "object") {
      for (const [key, value] of Object.entries(json.packages)) {
        if (!value?.version) continue;
        if (key === "") continue;

        let name = value.name;
        if (!name && key.startsWith("node_modules/")) {
          name = key.replace(/^node_modules\//, "");
        }
        if (!name) continue;

        packages.push({
          ecosystem: "npm",
          name,
          version: normalizeVersion(value.version)
        });
      }
      return dedupePackages(packages);
    }

    if (json.dependencies && typeof json.dependencies === "object") {
      const walk = (deps) => {
        for (const [name, value] of Object.entries(deps)) {
          if (value?.version) {
            packages.push({
              ecosystem: "npm",
              name,
              version: normalizeVersion(value.version)
            });
          }
          if (value?.dependencies) walk(value.dependencies);
        }
      };
      walk(json.dependencies);
    }

    return dedupePackages(packages);
  } catch {
    return [];
  }
}

function createSnapshotHash(projectRoot, packages) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        projectRoot: path.resolve(projectRoot),
        packages
      })
    )
    .digest("hex");
}

export function configureRuntimeHook(nextConfig = {}) {
  runtimeConfig = {
    ...runtimeConfig,
    ...nextConfig
  };
  return { ...runtimeConfig };
}

export function collectProjectInventory(options = {}) {
  const projectRoot = path.resolve(options.projectRoot || runtimeConfig.projectRoot || process.cwd());
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) return null;

  try {
    const packageJson = readJson(packageJsonPath);
    const packages = parsePackageLock(projectRoot);
    const fallbackPackages = parsePackageJsonDependencies(packageJson);
    const resolvedPackages = packages.length > 0 ? packages : fallbackPackages;
    const snapshotHash = createSnapshotHash(projectRoot, resolvedPackages);

    return {
      project: {
        id: options.projectId || "",
        root: projectRoot,
        name: packageJson.name || path.basename(projectRoot),
        label: options.appLabel || runtimeConfig.appLabel || packageJson.name || path.basename(projectRoot),
        ecosystems: ["npm"],
        manifest_paths: ["package.json", "package-lock.json"].filter((fileName) =>
          fs.existsSync(path.join(projectRoot, fileName))
        )
      },
      packages: resolvedPackages,
      snapshotHash
    };
  } catch {
    return null;
  }
}

export function buildRegistrationPayload(options = {}) {
  const inventory = collectProjectInventory(options);
  if (!inventory) return null;

  return {
    pid: process.pid,
    cwd: process.cwd(),
    source: "runtime-hook",
    observed_at: new Date().toISOString(),
    snapshot_hash: inventory.snapshotHash,
    process: {
      argv: process.argv.slice(1),
      execPath: process.execPath,
      title: process.title
    },
    project: inventory.project,
    packages: inventory.packages
  };
}

export async function registerProjectHook(options = {}) {
  const agentUrl = options.agentUrl || runtimeConfig.agentUrl || DEFAULT_AGENT_URL;
  const payload = buildRegistrationPayload(options);
  if (!payload) {
    return {
      ok: false,
      skipped: true,
      reason: "package.json not found in project root"
    };
  }

  try {
    const response = await fetch(`${agentUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return {
      ok: response.ok,
      status: response.status
    };
  } catch {
    return {
      ok: false,
      offline: true
    };
  }
}

export function reportEvent(type, detail, options = {}) {
  const agentUrl = options.agentUrl || runtimeConfig.agentUrl || DEFAULT_AGENT_URL;
  const payload = {
    pid: process.pid,
    type,
    detail,
    project_root: path.resolve(options.projectRoot || runtimeConfig.projectRoot || process.cwd())
  };

  return fetch(`${agentUrl}/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

if (runtimeConfig.autoRegister) {
  queueMicrotask(() => {
    registerProjectHook().catch(() => {});
  });
}

export default {
  buildRegistrationPayload,
  collectProjectInventory,
  configureRuntimeHook,
  registerProjectHook,
  reportEvent
};
