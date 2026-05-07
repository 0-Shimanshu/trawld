import { getState } from '../api/system'
import useQueryResource from './useQueryResource'
import { EMPTY_STATE, normalizeState } from '../utils/state'

export default function useFleetSummary(refreshToken) {
  const resource = useQueryResource(async () => {
    const summary = await getState()
    return normalizeState(summary)
  }, [refreshToken])

  return {
    ...resource,
    data: resource.data || EMPTY_STATE
  }
}

