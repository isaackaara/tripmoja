import Link from 'next/link'
import { Button } from '@/components/brand/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-tm-surface">
      <h1 className="tm-display mb-2" style={{ color: 'var(--tm-ink-300)' }}>404</h1>
      <p className="tm-h2 mb-2">Page not found</p>
      <p className="text-[14px] text-tm-ink-500 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link href="/">
        <Button variant="primary">Go home</Button>
      </Link>
    </div>
  )
}
