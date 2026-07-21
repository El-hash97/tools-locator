import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AdminSession } from '@/data/types'
import { ADMIN_CREDENTIAL } from '@/data/seed'

export const SESSION_KEY = 'tool-locator:session:v1'

export type AuthState = {
  session: AdminSession | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function readSession(): AdminSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(readSession)

  const signIn = useCallback(async (email: string, password: string) => {
    const ok =
      email.trim().toLowerCase() === ADMIN_CREDENTIAL.email &&
      password === ADMIN_CREDENTIAL.password
    if (!ok) throw new Error('Email atau kata sandi salah')

    const next: AdminSession = { email: ADMIN_CREDENTIAL.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const signOut = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ session, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return context
}
