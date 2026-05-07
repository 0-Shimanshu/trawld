import Analytics from '../components/Analytics'
import useAnalytics from '../hooks/useAnalytics'
import useAppShell from '../hooks/useAppShell'

export default function AnalyticsPage() {
  const { refreshToken } = useAppShell()
  const { data, loading } = useAnalytics(refreshToken)

  return <Analytics data={data || { alerts: [], packages: [], projects: [] }} loading={loading} />
}

