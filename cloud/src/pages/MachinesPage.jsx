import { useNavigate } from 'react-router-dom'
import Machines from '../components/Machines'
import { scanMachine } from '../api/machines'
import useAppShell from '../hooks/useAppShell'
import useMachines from '../hooks/useMachines'

export default function MachinesPage() {
  const navigate = useNavigate()
  const { refreshToken, requestRefresh } = useAppShell()
  const { data, loading } = useMachines(refreshToken)

  const handleScanMachine = async (machineId) => {
    try {
      await scanMachine(machineId)
      requestRefresh()
    } catch (error) {
      console.error('Failed to rescan machine:', error)
    }
  }

  return (
    <Machines
      data={{ machines: data?.machines || [] }}
      fullData={data?.fullData || { projects: [] }}
      loading={loading}
      onScanMachine={handleScanMachine}
      onSelectMachine={(machineId) => navigate(`/machines/${encodeURIComponent(machineId)}`)}
    />
  )
}

