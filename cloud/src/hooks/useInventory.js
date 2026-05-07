import { getInventory } from '../api/inventory'
import { getMachines } from '../api/machines'
import { getProjects } from '../api/projects'
import useQueryResource from './useQueryResource'

export default function useInventory(refreshToken, machineId = '') {
  return useQueryResource(async () => {
    const [inventory, projects, machines] = await Promise.all([
      getInventory({ machineId }),
      getProjects({ machineId }),
      machineId ? getMachines(machineId) : Promise.resolve({ machines: [] })
    ])

    return {
      packages: inventory.packages || [],
      projects: projects.projects || [],
      selectedMachine: machineId ? (machines.machines || [])[0] || null : null,
      scope: machineId ? 'machine' : 'master'
    }
  }, [refreshToken, machineId])
}

