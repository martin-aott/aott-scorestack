'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadForm, { type ConfirmedUpload } from '@/app/components/UploadForm'
import EnrichmentProgress from './components/EnrichmentProgress'

export default function HomePage() {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState<ConfirmedUpload | null>(null)
  const [enrichError, setEnrichError] = useState<string | null>(null)

  const handleEnrichError = (message: string) => {
    setEnrichError(message)
    setConfirmed(null)
  }

  // ── Enrichment in progress ─────────────────────────────────────────────────
  if (confirmed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <EnrichmentProgress
          blobUrl={confirmed.blob_url}
          linkedinColumn={confirmed.linkedin_column}
          originalFilename={confirmed.original_filename}
          onComplete={(runId) => router.push(`/run/${runId}/score`)}
          onError={handleEnrichError}
        />
      </main>
    )
  }

  // ── Upload flow ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">

        {/* Hero */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">ScoreStack</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Rank your contact list{' '}
            <span className="text-blue-600">with LinkedIn data</span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Upload a CSV, define what a good contact looks like, and get a scored,
            ranked list in minutes — no manual research required.
          </p>
        </header>

        {/* Enrichment error banner */}
        {enrichError && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700">Enrichment failed</p>
                <p className="text-xs text-red-600 mt-0.5">{enrichError}</p>
              </div>
              <button
                onClick={() => setEnrichError(null)}
                className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Upload card */}
        <div className="max-w-3xl mx-auto">
          <UploadForm onConfirmed={setConfirmed} />

          {/* How it works — subtle guidance */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { step: '1', label: 'Upload CSV', sub: 'With LinkedIn URLs' },
              { step: '2', label: 'Define criteria', sub: 'Titles, seniority, industry' },
              { step: '3', label: 'Get ranked list', sub: 'Scored by fit' },
            ].map(({ step, label, sub }) => (
              <div key={step} className="flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold flex items-center justify-center">
                  {step}
                </div>
                <p className="text-xs font-medium text-gray-600">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Phase 6: Saved models section ──────────────────────────────────
           * Replace this placeholder with:
           *   <SavedModels onSelect={(model) => { ... }} />
           * which fetches GET /api/models and lets the user pick a model
           * to re-run on a freshly uploaded CSV.
           * ──────────────────────────────────────────────────────────────── */}
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-300">
              Re-run a saved model · available in Phase 6
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
