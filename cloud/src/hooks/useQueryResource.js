import { useEffect, useEffectEvent, useState } from 'react'

export default function useQueryResource(loader, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const run = useEffectEvent(async () => {
    try {
      if (data === null) setLoading(true)
      setError('')
      const next = await loader()
      setData(next)
    } catch (nextError) {
      console.error(nextError)
      setError(nextError?.message || 'Failed to load resource')
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    run()
  }, deps)

  return {
    data,
    loading,
    error,
    refetch: run,
    setData
  }
}

