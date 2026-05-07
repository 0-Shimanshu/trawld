import Packages from '../components/Packages'
import useAppShell from '../hooks/useAppShell'
import useInventory from '../hooks/useInventory'

export default function PackagesPage() {
  const { refreshToken, requestRefresh } = useAppShell()
  const { data, loading } = useInventory(refreshToken)

  return (
    <Packages
      data={{ packages: data?.packages || [], projects: data?.projects || [] }}
      loading={loading}
      selectedMachine={data?.selectedMachine || null}
      scope={data?.scope || 'master'}
      onChange={requestRefresh}
    />
  )
}

