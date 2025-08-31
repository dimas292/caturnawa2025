// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            participant: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password!
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds (extended from 24 hours)
    updateAge: 24 * 60 * 60, // Update session every 24 hours when user is active
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds (extended from 24 hours)
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // If signing in, add user data to token
      if (user) {
        token.role = user.role
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.lastActivity = Date.now()
      }
      
      // Update last activity on every request
      if (token) {
        token.lastActivity = Date.now()
      }
      
      return token
    },
    async session({ session, token }) {
      // Only create session if token is valid and has required data
      if (token && token.id && token.role) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handles redirect on signin
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
    // Removed 'signUp' as it is not a valid property
  },
  secret: process.env.NEXTAUTH_SECRET,
}