'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppBar } from '@/components/brand/app-bar'
import { Button } from '@/components/brand/button'
import { Icon } from '@/components/brand/icon'
import { registerUser } from '@/lib/actions/auth'

interface FieldErrors {
  phone?: string
  name?: string
  password?: string
  form?: string
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('254') && digits.length > 3) {
    const local = digits.slice(3)
    const parts = [local.slice(0, 3), local.slice(3, 6), local.slice(6, 9)].filter(Boolean)
    return '+254 ' + parts.join(' ')
  }
  if (digits.startsWith('0')) {
    const parts = [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 10)].filter(Boolean)
    return parts.join(' ')
  }
  return digits
}

function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  const isKenyan =
    (digits.startsWith('254') && digits.length === 12) ||
    (digits.startsWith('0') && digits.length === 10)
  if (!digits) return 'Phone number is required'
  if (!isKenyan) return 'Enter a valid Kenyan number (07XX XXX XXX)'
  return undefined
}

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [phone,    setPhone]    = useState('')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState<FieldErrors>({})
  const [showPass,  setShowPass] = useState(false)

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setPhone(formatPhone(raw))
    setErrors((x) => ({ ...x, phone: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const e2: FieldErrors = {}

    const phoneErr = validatePhone(phone)
    if (phoneErr) e2.phone = phoneErr

    if (!name.trim() || name.trim().length < 2) e2.name = 'Enter your full name'

    if (!password || password.length < 8) e2.password = 'Password must be at least 8 characters'

    setErrors(e2)
    if (Object.keys(e2).length > 0) return

    startTransition(async () => {
      const result = await registerUser({ phone, name, email: email || undefined, password })
      if (result.error) {
        setErrors({ form: result.error })
        return
      }
      router.push('/trips')
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--tm-surface)' }}>
      <AppBar logo />

      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-sm mx-auto w-full">
        <h1 className="tm-h1 mb-1">Create account</h1>
        <p className="text-[14px] mb-8" style={{ color: 'var(--tm-ink-500)' }}>
          Join TripMoja to find and post intercity rides.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {/* Phone - first field */}
          <div>
            <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Phone number</span>
            <div className={`input-field ${errors.phone ? 'error' : ''}`}>
              <Icon name="phone" size={16} color="var(--tm-ink-500)" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="0712 345 678"
                className="flex-1 bg-transparent border-none outline-none text-[15px]"
                style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
              />
            </div>
            {errors.phone && (
              <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.phone}</p>
            )}
          </div>

          {/* Full name */}
          <div>
            <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Full name</span>
            <div className={`input-field ${errors.name ? 'error' : ''}`}>
              <Icon name="user-round" size={16} color="var(--tm-ink-500)" />
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })) }}
                placeholder="Aisha Wanjiku"
                className="flex-1 bg-transparent border-none outline-none text-[15px]"
                style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
              />
            </div>
            {errors.name && (
              <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.name}</p>
            )}
          </div>

          {/* Email - optional */}
          <div>
            <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Email (optional)</span>
            <div className="input-field">
              <Icon name="mail" size={16} color="var(--tm-ink-500)" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-transparent border-none outline-none text-[15px]"
                style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <span className="tm-label mb-1.5 block" style={{ color: 'var(--tm-ink-500)' }}>Password</span>
            <div className={`input-field ${errors.password ? 'error' : ''}`}>
              <Icon name="lock" size={16} color="var(--tm-ink-500)" />
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })) }}
                placeholder="Min 8 characters"
                className="flex-1 bg-transparent border-none outline-none text-[15px]"
                style={{ fontFamily: 'inherit', color: 'var(--tm-ink)' }}
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
            {errors.password && (
              <p className="text-[12px] mt-1 font-medium" style={{ color: 'var(--tm-error)' }}>{errors.password}</p>
            )}
            {!errors.password && password.length > 0 && password.length < 8 && (
              <p className="text-[12px] mt-1" style={{ color: 'var(--tm-ink-500)' }}>
                {8 - password.length} more characters needed
              </p>
            )}
          </div>

          {errors.form && (
            <p className="text-[13px] font-medium text-center" style={{ color: 'var(--tm-error)' }}>{errors.form}</p>
          )}

          <Button variant="primary" full type="submit" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-[14px] mt-6" style={{ color: 'var(--tm-ink-500)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--tm-blue)' }}>
            Sign in
          </Link>
        </p>
      </main>
    </div>
  )
}
