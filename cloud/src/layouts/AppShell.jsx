import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopNav from '../components/TopNav'
import useFleetSummary from '../hooks/useFleetSummary'
import { getSystemInfo, ingestNow } from '../api/system'
import { normalizeState } from '../utils/state'

const DEFAULT_SYSTEM_INFO = {
  public_cloud_url: window.location.origin,
  realtime_mode: 'http',
  open_agent_enrollment: true,
  state_version: 0,
  last_updated: ''
}

export default function AppShell() {
  const [refreshToken, setRefreshToken] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [systemInfo, setSystemInfo] = useState(DEFAULT_SYSTEM_INFO)
  const socketRef = useRef(null)
  const reconnectRef = useRef(null)
  const pollRef = useRef(null)
  const idlePollsRef = useRef(0)
  const { data: summary, loading: summaryLoading, setData: setSummary } = useFleetSummary(refreshToken)

  const requestRefresh = useEffectEvent(() => {
    setRefreshToken((current) => current + 1)
  })

  const pollSystemInfo = useEffectEvent(async () => {
    try {
      const next = await getSystemInfo()
      setSystemInfo((current) => {
        if ((next.state_version || 0) > (current.state_version || 0)) {
          idlePollsRef.current = 0
          startTransition(() => requestRefresh())
        } else {
          idlePollsRef.current += 1
        }
        return { ...current, ...next }
      })
    } catch (error) {
      console.error('System info polling failed:', error)
      idlePollsRef.current += 1
    }
  })

  useEffect(() => {
    getSystemInfo()
      .then((next) => setSystemInfo((current) => ({ ...current, ...next })))
      .catch((error) => console.error('Failed to load system info:', error))
  }, [])

  useEffect(() => {
    let isDisposed = false
    const useWebSocket = systemInfo.realtime_mode !== 'http'

    if (!useWebSocket) {
      setWsConnected(true)
      const schedulePoll = () => {
        const intervalMs = idlePollsRef.current >= 6 ? 30000 : idlePollsRef.current >= 2 ? 15000 : 5000
        pollRef.current = setTimeout(async () => {
          if (!isDisposed) {
            await pollSystemInfo()
            schedulePoll()
          }
        }, intervalMs)
      }
      schedulePoll()

      return () => {
        isDisposed = true
        if (pollRef.current) clearTimeout(pollRef.current)
      }
    }

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/agents`)
      socketRef.current = ws

      ws.onopen = () => {
        if (isDisposed) return
        setWsConnected(true)
        ws.send(JSON.stringify({ type: 'DASHBOARD_HELLO' }))
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'STATE_SYNC' && message.state) {
            startTransition(() => {
              setSummary(normalizeState(message.state))
              setRefreshToken((current) => current + 1)
            })
            return
          }

          if (['MACHINE_UPDATE', 'PROJECT_UPDATE', 'INVENTORY_UPDATE', 'ALERT_UPDATE', 'AGENT_STATUS_UPDATE'].includes(message.type)) {
            setRefreshToken((current) => current + 1)
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }

      ws.onclose = () => {
        if (isDisposed) return
        setWsConnected(false)
        reconnectRef.current = setTimeout(connect, 5000)
      }

      ws.onerror = () => {
        setWsConnected(false)
      }
    }

    connect()

    return () => {
      isDisposed = true
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (socketRef.current) socketRef.current.close()
    }
  }, [systemInfo.realtime_mode])

  useEffect(() => {
    if ((summary.state_version || 0) > (systemInfo.state_version || 0)) {
      setSystemInfo((current) => ({
        ...current,
        state_version: summary.state_version,
        last_updated: summary.last_updated || current.last_updated
      }))
    }
  }, [summary.state_version, summary.last_updated])

  const handleIngestNow = async () => {
    if (ingesting) return

    try {
      setIngesting(true)
      await ingestNow()
      requestRefresh()
    } catch (error) {
      console.error('Failed to sync OSV data:', error)
    } finally {
      setIngesting(false)
    }
  }

  const shellContext = useMemo(() => ({
    refreshToken,
    requestRefresh,
    systemInfo,
    summary,
    wsConnected
  }), [refreshToken, requestRefresh, systemInfo, summary, wsConnected])

  return (
    <div className="app-canvas min-h-screen">
      <TopNav
        wsConnected={wsConnected}
        summary={summary}
        summaryLoading={summaryLoading}
        onRefresh={requestRefresh}
        onIngestNow={handleIngestNow}
        ingesting={ingesting}
      />
      <main className="app-shell mx-auto max-w-[1720px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 2xl:px-12">
        <Outlet context={shellContext} />
      </main>
    </div>
  )
}
