'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppBar } from '@/components/brand/app-bar'
import { Button } from '@/components/brand/button'
import { Icon } from '@/components/brand/icon'
import { loginUser } from '@/lib/actions/auth'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [identifier, setIdentifier] = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier || !password) {
      setError('Enter your phone/email and password')
      return
    }

    startTransition(async () => {
      const result = await loginUser(identifier.trim(), password)
      if (result.error) {
        setError(result.error)
        return
      }
      const next = searchParams.get('next') ?? '/trips'
      router.push(next)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-tm-surface">
      <AppBar logo />

      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-sm mx-auto w-full">
        <h1 className="tm-h1 mb-1">Welcome back</h1>
        <p className="text-[14px] text-tm-ink-500 mb-8">Sign in to find or post a trip.</p>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <span className="tm-label mb-1.5 block text-tm-ink-500">Phone or email</span>
            <div className="input-field">
              <Icon name="user-round" size={16} color="var(--tm-ink-500)" />
              <input
                type="text"
                inputMode="email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(null) }}
                placeholder="0712 345 678 or you@example.com"
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-tm-ink placeholder:text-tm-ink-300"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <div>
            <span className="tm-label mb-1.5 block text-tm-ink-500">Password</span>
            <div className="input-field">
              <Icon name="lock" size={16} color="var(--tm-ink-500)" />
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="••••••••"
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-tm-ink placeholder:text-tm-ink-300"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{ color: 'var(--tm-ink-500)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Icon name={showPass ? 'eye-off' : 'eye'} size={16} color="var(--tm-ink-500)" />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[13px] font-medium text-center" style={{ color: 'var(--tm-error)' }}>{error}</p>
          )}

          <Button variant="primary" full type="submit" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-[14px] text-tm-ink-500 mt-6">
          No account?{' '}
          <Link href="/register" className="text-tm-blue font-semibold">
            Create one
          </Link>
        </p>
      </main>
    </div>
  )
}
