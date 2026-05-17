import type { Trip } from '@/types'

const FEED_CACHE_KEY = 'tripmoja:feed:v1'

interface FeedCache {
  trips: Trip[]
  savedAt: number
}

export function saveFeedCache(trips: Trip[]): void {
  if (typeof window === 'undefined' || trips.length === 0) return
  try {
    const payload: FeedCache = { trips, savedAt: Date.now() }
    localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(payload))
  } catch {}
}

export function loadFeedCache(): FeedCache | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(FEED_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FeedCache
  } catch {
    return null
  }
}

export function formatCacheAge(savedAt: number): string {
  const diffMin = Math.floor((Date.now() - savedAt) / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffH = Math.floor(diffMin / 60)
  return `${diffH}h ago`
}
