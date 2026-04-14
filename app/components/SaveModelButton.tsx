'use client'

import { useState } from 'react'
import type { Criterion } from '@/app//lib/scoring'
import SaveModelModal from '@/app/components/SaveModelModal'

interface SaveModelButtonProps {
  criteria: Criterion[]
}

export default function SaveModelButton({ criteria }: SaveModelButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaved = (_modelId: string) => {
    setShowModal(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={saved}
        className={
          saved
            ? 'inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full'
            : 'inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer'
        }
      >
        {saved ? (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Saved!
          </>
        ) : (
          'Save as model'
        )}
      </button>

      {showModal && (
        <SaveModelModal
          criteria={criteria}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
