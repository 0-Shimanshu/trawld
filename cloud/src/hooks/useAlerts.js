import { getAlerts } from '../api/alerts'
import useQueryResource from './useQueryResource'

export default function useAlerts(refreshToken, options = {}) {
  return useQueryResource(async () => {
    const response = await getAlerts(options)
    return {
      alerts: response.alerts || []
    }
  }, [refreshToken, options.machineId || '', options.projectId || '', options.status || ''])
}

