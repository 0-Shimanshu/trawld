import { useParams } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import { scanMachine } from '../api/machines'
import useAppShell from '../hooks/useAppShell'
import useMachineDetail from '../hooks/useMachineDetail'

export default function MachineDetailPage() {
  const { machineId = '' } = useParams()
  const { refreshToken, requestRefresh } = useAppShell()
  const { data, loading } = useMachineDetail(machineId, refreshToken)

  const handleScanMachine = async () => {
    try {
      await scanMachine(machineId)
      requestRefresh()
    } catch (error) {
      console.error('Failed to rescan machine:', error)
    }
  }

  return (
    <Dashboard
      data={data.data}
      loading={loading}
      machine={data.machine}
      onScanMachine={handleScanMachine}
    />
  )
}

