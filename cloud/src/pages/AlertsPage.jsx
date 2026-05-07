import Alerts from '../components/Alerts'
import useAlerts from '../hooks/useAlerts'
import useAppShell from '../hooks/useAppShell'

export default function AlertsPage() {
  const { refreshToken, requestRefresh } = useAppShell()
  const { data, loading } = useAlerts(refreshToken)

  return <Alerts data={data || { alerts: [] }} loading={loading} onChange={requestRefresh} />
}

