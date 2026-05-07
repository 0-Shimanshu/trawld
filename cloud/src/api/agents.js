import { getJson, postJson } from './http'

export function getAgents() {
  return getJson('/api/agents')
}

export function revokeAgent(machineId) {
  return postJson(`/api/agents/${encodeURIComponent(machineId)}/revoke`)
}
