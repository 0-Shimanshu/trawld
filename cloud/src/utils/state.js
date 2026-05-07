export const EMPTY_STATE = {
  alerts: [],
  machines: [],
  projects: [],
  packages: [],
  agents: []
}

export function normalizeState(next = {}) {
  return {
    alerts: next.alerts || [],
    machines: next.machines || [],
    projects: next.projects || [],
    packages: next.packages || [],
    agents: next.agents || []
  }
}
