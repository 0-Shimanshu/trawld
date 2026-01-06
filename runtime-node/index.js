import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const AGENT_URL = 'http://127.0.0.1:7654';

function getPackages() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) return [];
    
    const json = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = { ...json.dependencies, ...json.devDependencies };
    
    return Object.entries(deps).map(([name, version]) => ({
      ecosystem: 'npm',
      name,
      version: version.replace('^', '').replace('~', '') // Simple clean
    }));
  } catch (e) {
    return [];
  }
}

async function register() {
  const packages = getPackages();
  const payload = {
    pid: process.pid,
    cwd: process.cwd(),
    packages
  };

  try {
    const res = await fetch(`${AGENT_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      console.log(`[VulnHook] Registered PID ${process.pid} with System Agent`);
    } else {
      console.error(`[VulnHook] Failed to register: ${res.statusText}`);
    }
  } catch (e) {
    // Silent fail if agent is down, or log debug
    // console.error(`[VulnHook] Agent unreachable`);
  }
}

// Auto-register on load
register();

// Example behavior hook (placeholder for future)
export function reportEvent(type, detail) {
  fetch(`${AGENT_URL}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid: process.pid, type, detail })
  }).catch(() => {});
}
