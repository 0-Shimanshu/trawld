import { getAlerts } from '../api/alerts'
import { getInventory } from '../api/inventory'
import { getMachines } from '../api/machines'
import { getProjects } from '../api/projects'
import useQueryResource from './useQueryResource'
import { EMPTY_STATE, normalizeState } from '../utils/state'

export default function useMachineDetail(machineId, refreshToken) {
  const resource = useQueryResource(async () => {
    if (!machineId) return { machine: null, data: EMPTY_STATE }

    const [machines, projects, inventory, alerts] = await Promise.all([
      getMachines(machineId),
      getProjects({ machineId }),
      getInventory({ machineId }),
      getAlerts({ machineId })
    ])

    return {
      machine: (machines.machines || [])[0] || null,
      data: normalizeState({
        machines: machines.machines,
        projects: projects.projects,
        packages: inventory.packages,
        alerts: alerts.alerts
      })
    }
  }, [machineId, refreshToken])

  return {
    ...resource,
    data: resource.data || { machine: null, data: EMPTY_STATE }
  }
}

