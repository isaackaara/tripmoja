export function TripCardSkeleton() {
  return (
    <div className="card flex flex-col gap-2.5 animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 w-20 rounded-md" style={{ background: 'var(--tm-border)' }} />
        <div className="h-6 w-16 rounded-md" style={{ background: 'var(--tm-border)' }} />
      </div>
      <div className="h-4 w-32 rounded-md" style={{ background: 'var(--tm-border)' }} />
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex-none" style={{ background: 'var(--tm-border)' }} />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3.5 w-28 rounded" style={{ background: 'var(--tm-border)' }} />
          <div className="h-3 w-16 rounded" style={{ background: 'var(--tm-border)' }} />
        </div>
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="grid gap-3">
      <TripCardSkeleton />
      <TripCardSkeleton />
      <TripCardSkeleton />
    </div>
  )
}
