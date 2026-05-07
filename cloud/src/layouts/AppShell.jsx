import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { logout } from '../api/auth'
import TopNav from '../components/TopNav'
import useFleetSummary from '../hooks/useFleetSummary'
import { ingestNow } from '../api/system'
import { normalizeState } from '../utils/state'

export default function AppShell({ session, onLogout }) {
  const [refreshToken, setRefreshToken] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const socketRef = useRef(null)
  const reconnectRef = useRef(null)
  const pollRef = useRef(null)
  const { data: summary, loading: summaryLoading, setData: setSummary } = useFleetSummary(refreshToken)

  const requestRefresh = useEffectEvent(() => {
    setRefreshToken((current) => current + 1)
  })

  useEffect(() => {
    let isDisposed = false
    const useWebSocket = session?.realtime_mode !== 'http'

    if (!useWebSocket) {
      setWsConnected(true)
      pollRef.current = setInterval(() => {
        if (!isDisposed) requestRefresh()
      }, 15000)

      return () => {
        isDisposed = true
        if (pollRef.current) clearInterval(pollRef.current)
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
  }, [session?.realtime_mode])

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

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      onLogout?.()
    }
  }

  const shellContext = useMemo(() => ({
    refreshToken,
    requestRefresh,
    session,
    summary,
    wsConnected
  }), [refreshToken, requestRefresh, session, summary, wsConnected])

  return (
    <div className="app-canvas min-h-screen">
      <TopNav
        wsConnected={wsConnected}
        summary={summary}
        summaryLoading={summaryLoading}
        onRefresh={requestRefresh}
        onIngestNow={handleIngestNow}
        ingesting={ingesting}
        onLogout={handleLogout}
      />
      <main className="app-shell mx-auto max-w-[1720px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 2xl:px-12">
        <Outlet context={shellContext} />
      </main>
    </div>
  )
}
