import fetch from "node-fetch";
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLOUD_HTTP = process.env.CLOUD_HTTP || "http://localhost:4000";
const CLOUD_WS = process.env.CLOUD_WS || "ws://localhost:4000/agents";
const CONFIG_PATH = path.join(__dirname, "config.json");
const DATA_DIR = path.join(__dirname, "data");
const ID_PATH = path.join(DATA_DIR, "machine_id.txt");
const LOG_PATH = path.join(DATA_DIR, "actions.log");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadOrCreateId() {
  ensureDataDir();
  try {
    const id = fs.readFileSync(ID_PATH, "utf-8").trim();
    if (id) return id;
  } catch {}
  const id = uuidv4();
  fs.writeFileSync(ID_PATH, id);
  return id;
}

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { policy: { critical: "kill", high: "block", medium: "alert", low: "log" } };
  }
}

function parsePackageLock() {
  const candidates = [
    path.join(process.cwd(), "package-lock.json"),
    path.join(process.cwd(), "..", "package-lock.json"),
    path.join(process.cwd(), "..", "..", "package-lock.json")
  ];
  for (const lockPath of candidates) {
    try {
      const raw = fs.readFileSync(lockPath, "utf-8");
      const json = JSON.parse(raw);
      const deps = [];
      const entries = json.packages || {};
      for (const [key, val] of Object.entries(entries)) {
        let name = val.name;
        if (!name && key.startsWith("node_modules/")) {
          name = key.replace("node_modules/", "");
        }
        if (!name || !val.version) continue;
        deps.push({ ecosystem: "npm", name, version: val.version });
      }
      if (deps.length) return deps;
    } catch {}
  }
  return [];
}

function pipFreeze() {
  try {
    const r = spawnSync("python", ["-m", "pip", "freeze"], { encoding: "utf-8" });
    if (r.status !== 0) return [];
    const lines = r.stdout.split("\n").map(l => l.trim()).filter(Boolean);
    const deps = [];
    for (const line of lines) {
      const parts = line.split("==");
      if (parts.length === 2) deps.push({ ecosystem: "PyPI", name: parts[0], version: parts[1] });
    }
    return deps;
  } catch {
    return [];
  }
}

async function register(machineId) {
  const payload = { uuid: machineId, user_id: null, os: os.platform(), hostname: os.hostname() };
  try {
    await fetch(`${CLOUD_HTTP}/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    logAction(`registered ${machineId}`);
    return true;
  } catch {
    logAction(`register failed`);
    return false;
  }
}

async function sendInventory(machineId, packages) {
  const payload = { machine_id: machineId, packages };
  try {
    await fetch(`${CLOUD_HTTP}/inventory`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    logAction(`inventory sent ${packages.length} packages`);
    return true;
  } catch {
    logAction(`inventory failed`);
    return false;
  }
}

function logAction(text) {
  ensureDataDir();
  const line = `[${new Date().toISOString()}] ${text}\n`;
  fs.appendFileSync(LOG_PATH, line);
}

function enforce(policy, alert, inventory) {
  const sev = alert.severity || "low";
  const action = policy[sev] || "log";
  const pkg = alert.package?.name || "";
  const installed = inventory.some(p => p.ecosystem === alert.package?.ecosystem && p.name === pkg);
  if (!installed) return;
  if (action === "kill") {
    logAction(`kill process for ${pkg} due to ${alert.cve_id}`);
  } else if (action === "block") {
    logAction(`block network for ${pkg} due to ${alert.cve_id}`);
  } else if (action === "alert") {
    logAction(`alert user for ${pkg} due to ${alert.cve_id}`);
  } else {
    logAction(`log event for ${pkg} due to ${alert.cve_id}`);
  }
}

async function main() {
  const machineId = loadOrCreateId();
  const inventory = [...parsePackageLock(), ...pipFreeze()];
  const config = readConfig();
  async function tryRegisterAndInventory() {
    await register(machineId);
    await sendInventory(machineId, inventory);
  }
  await tryRegisterAndInventory();
  setInterval(tryRegisterAndInventory, 60000);
  function connectWS() {
    const ws = new WebSocket(CLOUD_WS);
    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "HELLO", machine_id: machineId }));
      const hb = setInterval(() => {
        try { ws.send(JSON.stringify({ type: "HEARTBEAT" })); } catch {}
      }, 30000);
      ws.on("close", () => clearInterval(hb));
    });
    ws.on("message", msg => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === "CVE_ALERT") {
          enforce(config.policy, data, inventory);
        }
      } catch {}
    });
    ws.on("close", () => setTimeout(connectWS, 5000));
    ws.on("error", () => {});
  }
  connectWS();
}

main().catch(() => {});
