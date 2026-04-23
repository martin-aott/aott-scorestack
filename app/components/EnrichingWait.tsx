'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface StatusResponse {
  status: string
  enrichedCount: number
  failedCount: number
  totalContacts: number
}

interface EnrichingWaitProps {
  runId: string
}

const POLL_INTERVAL_MS = 5000

export default function EnrichingWait({ runId }: EnrichingWaitProps) {
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/runs/${runId}/status`)
        if (!res.ok) return
        const data: StatusResponse = await res.json()
        if (data.status !== 'enriching') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          router.refresh()
        }
      } catch {
        console.error('Failed to fetch run status, trying again in `${POLL_INTERVAL_MS / 1000}` seconds.')
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [runId, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-sm w-full text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="mt-5 text-sm font-semibold text-gray-800">Still enriching…</h2>
        <p className="mt-1.5 text-xs text-gray-500">
          This page will update automatically when results are ready.
        </p>
      </div>
    </div>
  )
}
