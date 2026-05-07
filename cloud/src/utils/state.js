export const EMPTY_STATE = {
  alerts: [],
  machines: [],
  projects: [],
  packages: [],
  agents: [],
  state_version: 0,
  last_updated: ''
}

export function normalizeState(next = {}) {
  return {
    alerts: next.alerts || [],
    machines: next.machines || [],
    projects: next.projects || [],
    packages: next.packages || [],
    agents: next.agents || [],
    state_version: next.state_version || 0,
    last_updated: next.last_updated || ''
  }
}
