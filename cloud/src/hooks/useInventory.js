import { getState } from '../api/system'
import useQueryResource from './useQueryResource'

export default function useInventory(refreshToken, machineId = '') {
  return useQueryResource(async () => {
    const state = await getState(machineId ? { machineId } : {})
    return {
      packages: state.packages || [],
      projects: state.projects || [],
      selectedMachine: machineId ? (state.machines || [])[0] || null : null,
      scope: machineId ? 'machine' : 'master'
    }
  }, [refreshToken, machineId])
}
