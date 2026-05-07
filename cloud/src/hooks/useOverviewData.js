import { getAlerts } from '../api/alerts'
import { getAgents } from '../api/agents'
import { getInventory } from '../api/inventory'
import { getMachines } from '../api/machines'
import { getProjects } from '../api/projects'
import useQueryResource from './useQueryResource'
import { EMPTY_STATE, normalizeState } from '../utils/state'

export default function useOverviewData(refreshToken) {
  const resource = useQueryResource(async () => {
    const [machines, projects, inventory, alerts, agents] = await Promise.all([
      getMachines(),
      getProjects(),
      getInventory(),
      getAlerts(),
      getAgents()
    ])

    return normalizeState({
      machines: machines.machines,
      projects: projects.projects,
      packages: inventory.packages,
      alerts: alerts.alerts,
      agents: agents.agents
    })
  }, [refreshToken])

  return {
    ...resource,
    data: resource.data || EMPTY_STATE
  }
}
