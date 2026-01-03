import './global-polyfills.js'
import { config } from 'dotenv'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

config({ path: '.env.test' })

afterEach(() => {
  cleanup()
})

vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn(() => process.env),
}))

vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: Record<string, unknown>) {
    return {
      type: 'img',
      props,
      toString: () =>
        `<img ${Object.keys(props)
          .map(key => `${key}="${String(props[key])}"`)
          .join(' ')} />`,
    }
  },
}))

vi.mock('next/font/google', () => ({
  Geist: () => ({ className: 'font-geist' }),
  Geist_Mono: () => ({ className: 'font-geist-mono' }),
}))

vi.mock('next/font/local', () => ({
  default: () => ({ className: 'font-local' }),
}))

globalThis.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

class MockIntersectionObserver {
  root: Element | null = null
  rootMargin = ''
  thresholds: number[] = []

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver as typeof IntersectionObserver

globalThis.ResizeObserver = class MockResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
} as typeof ResizeObserver
