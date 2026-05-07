import { getJson, postJson } from './http'

export function getAlerts({ machineId = '', projectId = '', status = '' } = {}) {
  const query = new URLSearchParams()
  if (machineId) query.set('machine_id', machineId)
  if (projectId) query.set('project_id', projectId)
  if (status) query.set('status', status)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return getJson(`/alerts${suffix}`)
}

export function acknowledgeAlert(id) {
  return postJson(`/alerts/${encodeURIComponent(id)}/ack`)
}

export function remediateAlert(id) {
  return postJson(`/alerts/${encodeURIComponent(id)}/remediate`)
}

