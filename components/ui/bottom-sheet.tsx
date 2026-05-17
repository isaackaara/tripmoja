'use client'

import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const closedRef = useRef(false)

  useEffect(() => {
    if (!open) return
    closedRef.current = false
    history.pushState({ bottomSheet: true }, '')

    function handlePop() {
      if (!closedRef.current) {
        closedRef.current = true
        onClose()
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  function handleClose() {
    if (!closedRef.current) {
      closedRef.current = true
      history.back()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div
        className="relative z-10 rounded-t-[24px] overflow-y-auto"
        style={{
          background: 'var(--tm-white)',
          maxHeight: '90dvh',
          boxShadow: 'var(--sh-pop)',
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'var(--tm-border-strong)' }}
          />
        </div>
        {title && (
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: 'var(--tm-border)' }}
          >
            <h2 className="tm-h3">{title}</h2>
          </div>
        )}
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
