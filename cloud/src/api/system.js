import { getJson, postJson } from './http'

export function getState(params = {}) {
  const query = new URLSearchParams()
  if (params.machineId) query.set('machine_id', params.machineId)
  if (params.projectId) query.set('project_id', params.projectId)
  const qs = query.toString()
  return getJson(qs ? `/state?${qs}` : '/state')
}

export function getSystemInfo() {
  return getJson('/api/system/info')
}

export function ingestNow() {
  return postJson('/ingest-now')
}
