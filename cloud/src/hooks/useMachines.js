import { getMachines } from '../api/machines'
import { getProjects } from '../api/projects'
import useQueryResource from './useQueryResource'

export default function useMachines(refreshToken) {
  return useQueryResource(async () => {
    const [machines, projects] = await Promise.all([
      getMachines(),
      getProjects()
    ])

    return {
      machines: machines.machines || [],
      fullData: {
        projects: projects.projects || []
      }
    }
  }, [refreshToken])
}

