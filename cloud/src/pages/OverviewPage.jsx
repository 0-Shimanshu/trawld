import MasterDashboard from '../components/MasterDashboard'
import AgentOnboarding from '../components/AgentOnboarding'
import { scanMachine } from '../api/machines'
import useAppShell from '../hooks/useAppShell'
import useOverviewData from '../hooks/useOverviewData'

export default function OverviewPage() {
  const { refreshToken, requestRefresh, systemInfo } = useAppShell()
  const { data, loading } = useOverviewData(refreshToken)

  const handleScanAll = async () => {
    try {
      await Promise.all((data.machines || []).map((machine) => scanMachine(machine.uuid)))
      requestRefresh()
    } catch (error) {
      console.error('Failed to rescan fleet:', error)
    }
  }

  return (
    <div className="space-y-8">
      <AgentOnboarding systemInfo={systemInfo} />
      <MasterDashboard data={data} loading={loading} onScanAll={handleScanAll} />
    </div>
  )
}
