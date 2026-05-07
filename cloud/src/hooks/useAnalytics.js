import { getAlerts } from '../api/alerts'
import { getInventory } from '../api/inventory'
import { getProjects } from '../api/projects'
import useQueryResource from './useQueryResource'

export default function useAnalytics(refreshToken) {
  return useQueryResource(async () => {
    const [alerts, inventory, projects] = await Promise.all([
      getAlerts(),
      getInventory(),
      getProjects()
    ])

    return {
      alerts: alerts.alerts || [],
      packages: inventory.packages || [],
      projects: projects.projects || []
    }
  }, [refreshToken])
}

