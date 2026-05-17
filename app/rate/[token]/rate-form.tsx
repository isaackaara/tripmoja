'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/brand/button'
import { submitRating } from '@/lib/actions/ratings'
import { Icon } from '@/components/brand/icon'

export default function RateForm({ token, otherName }: { token: string; otherName: string }) {
  const [rating,    setRating]    = useState(0)
  const [hovered,   setHovered]   = useState(0)
  const [comment,   setComment]   = useState('')
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Select a star rating'); return }

    startTransition(async () => {
      const result = await submitRating(token, rating, comment || undefined)
      if (result.error) { setError(result.error); return }
      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <p className="text-[15px] font-semibold text-tm-ink mb-1">Thank you!</p>
        <p className="text-[14px] text-tm-ink-500">
          Your rating will be revealed once {otherName} also submits theirs.
        </p>
      </div>
    )
  }

  const display = hovered || rating

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="card p-5">
        <p className="text-[14px] font-semibold text-tm-ink-500 mb-3">
          How was your experience with {otherName}?
        </p>

        <div className="flex gap-2 justify-center mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => { setRating(star); setError(null) }}
              className="w-10 h-10 flex items-center justify-center"
              aria-label={`${star} star`}
            >
              <Icon
                name="star"
                size={28}
                color={star <= display ? 'var(--tm-orange)' : 'var(--tm-border-strong)'}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-[13px] text-tm-ink-500">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
          </p>
        )}
      </div>

      <div>
        <span className="tm-label mb-1.5 block text-tm-ink-500">Comment (optional)</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 text-[15px] border outline-none resize-none"
          style={{
            borderRadius: 12,
            fontFamily:   'inherit',
            height:       96,
            background:   'var(--tm-white)',
            color:        'var(--tm-ink)',
            borderColor:  'var(--tm-border)',
          }}
          placeholder="Anything to add?"
          maxLength={500}
        />
      </div>

      {error && (
        <p className="text-[13px] font-medium text-center" style={{ color: 'var(--tm-error)' }}>{error}</p>
      )}

      <Button variant="primary" full type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit rating'}
      </Button>
    </form>
  )
}
