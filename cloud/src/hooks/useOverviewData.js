import { getState } from '../api/system'
import useQueryResource from './useQueryResource'
import { EMPTY_STATE, normalizeState } from '../utils/state'

export default function useOverviewData(refreshToken) {
  const resource = useQueryResource(async () => {
    return normalizeState(await getState())
  }, [refreshToken])

  return {
    ...resource,
    data: resource.data || EMPTY_STATE
  }
}
