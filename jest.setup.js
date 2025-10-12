// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Web APIs needed by Next.js API routes
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill for fetch API
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}

// Polyfill for Headers
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.map = new Map()
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.map.set(key.toLowerCase(), value)
        })
      }
    }
    get(key) {
      return this.map.get(key.toLowerCase()) || null
    }
    set(key, value) {
      this.map.set(key.toLowerCase(), value)
    }
    has(key) {
      return this.map.has(key.toLowerCase())
    }
    delete(key) {
      this.map.delete(key.toLowerCase())
    }
    forEach(callback) {
      this.map.forEach((value, key) => callback(value, key, this))
    }
  }
}

// Polyfill for Request
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = input
      this.method = init.method || 'GET'
      this.headers = new global.Headers(init.headers || {})
      this.body = init.body
      this._bodyInit = init.body
    }

    async json() {
      if (typeof this._bodyInit === 'string') {
        return JSON.parse(this._bodyInit)
      }
      return this._bodyInit
    }

    async text() {
      return String(this._bodyInit || '')
    }
  }
}

// Polyfill for Response
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new global.Headers(init.headers || {})
      this.ok = this.status >= 200 && this.status < 300
    }

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }

    async text() {
      return String(this.body || '')
    }

    static json(data, init = {}) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      })
    }
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: null,
      status: 'unauthenticated',
    }
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    participant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    competition: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    registration: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

