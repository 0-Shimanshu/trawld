import { getState } from '../api/system'
import useQueryResource from './useQueryResource'

export default function useAlerts(refreshToken, options = {}) {
  return useQueryResource(async () => {
    const state = await getState()
    let alerts = state.alerts || []
    if (options.machineId) alerts = alerts.filter((a) => a.machine_id === options.machineId)
    if (options.projectId) alerts = alerts.filter((a) => a.project_id === options.projectId)
    if (options.status) alerts = alerts.filter((a) => a.status === options.status)
    return { alerts }
  }, [refreshToken, options.machineId || '', options.projectId || '', options.status || ''])
}
