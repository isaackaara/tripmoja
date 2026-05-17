import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const credentialsSchema = z.object({
  email:    z.string().min(1),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn:  '/login',
    signOut: '/login',
    error:   '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email or phone', type: 'text' },
        password: { label: 'Password',       type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email: identifier, password } = parsed.data

        const isPhone = /^\+?[\d\s]{7,}$/.test(identifier)
        const user = isPhone
          ? await prisma.user.findFirst({ where: { phone: identifier.replace(/\s/g, '') } })
          : await prisma.user.findUnique({ where: { email: identifier } })

        if (!user?.password) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const adminEmails = process.env.ADMIN_EMAIL?.split(',').map((e) => e.trim()) ?? []
        token.isAdmin = adminEmails.includes(user.email ?? '')
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id      = token.id as string
        session.user.isAdmin = !!token.isAdmin
      }
      return session
    },
  },
})
