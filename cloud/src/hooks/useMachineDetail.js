import { getState } from '../api/system'
import useQueryResource from './useQueryResource'
import { EMPTY_STATE, normalizeState } from '../utils/state'

export default function useMachineDetail(machineId, refreshToken) {
  const resource = useQueryResource(async () => {
    if (!machineId) return { machine: null, data: EMPTY_STATE }
    const state = await getState({ machineId })
    return {
      machine: (state.machines || [])[0] || null,
      data: normalizeState(state)
    }
  }, [machineId, refreshToken])

  return {
    ...resource,
    data: resource.data || { machine: null, data: EMPTY_STATE }
  }
}
