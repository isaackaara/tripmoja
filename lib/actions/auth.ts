'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

interface RegisterInput {
  phone: string
  name: string
  email?: string
  password: string
}

export async function registerUser(input: RegisterInput): Promise<{ error?: string }> {
  const { phone, name, email, password } = input

  const cleanPhone = phone.replace(/\s/g, '')
  const cleanName  = name.trim()
  const cleanEmail = email?.trim() || null

  if (!cleanPhone || !cleanName || !password || password.length < 8) {
    return { error: 'Invalid input' }
  }

  const phoneExists = await prisma.user.findFirst({ where: { phone: cleanPhone } })
  if (phoneExists) return { error: 'Phone number already registered' }

  if (cleanEmail) {
    const emailExists = await prisma.user.findUnique({ where: { email: cleanEmail } })
    if (emailExists) return { error: 'Email already registered' }
  }

  const userEmail = cleanEmail ?? `${crypto.randomUUID().replace(/-/g, '')}@tripmoja.local`
  const hash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name: cleanName, email: userEmail, phone: cleanPhone, password: hash },
  })

  try {
    await signIn('credentials', { email: userEmail, password, redirect: false })
  } catch {
    // signIn throws even on success in some next-auth versions — ignore
  }

  return {}
}

export async function loginUser(identifier: string, password: string): Promise<{ error?: string }> {
  try {
    await signIn('credentials', { email: identifier, password, redirect: false })
    return {}
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Invalid phone/email or password' }
    }
    throw err
  }
}
