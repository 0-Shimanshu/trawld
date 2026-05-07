import { getJson } from './http'

export function getProjects({ machineId = '', projectId = '' } = {}) {
  const query = new URLSearchParams()
  if (machineId) query.set('machine_id', machineId)
  if (projectId) query.set('project_id', projectId)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return getJson(`/projects${suffix}`)
}

