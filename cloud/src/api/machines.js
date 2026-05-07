import { getJson, postJson } from './http'

function withMachineQuery(url, machineId = '') {
  if (!machineId) return url
  const query = new URLSearchParams({ machine_id: machineId })
  return `${url}?${query.toString()}`
}

export function getMachines(machineId = '') {
  return getJson(withMachineQuery('/machines', machineId))
}

export function scanMachine(machineId) {
  return postJson(`/scan-machine/${encodeURIComponent(machineId)}`)
}

