import { getState } from '../api/system'
import useQueryResource from './useQueryResource'

export default function useMachines(refreshToken) {
  return useQueryResource(async () => {
    const state = await getState()
    return { machines: state.machines || [] }
  }, [refreshToken])
}
