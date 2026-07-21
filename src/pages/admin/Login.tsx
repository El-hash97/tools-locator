import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'

export default function Login() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/admin/tools" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal masuk')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-10">
      <header className="flex items-center gap-2 py-4">
        <Link
          to="/"
          aria-label="Kembali"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 active:bg-neutral-200"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-lg font-bold">Masuk Admin</h1>
      </header>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-neutral-200"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota focus:ring-2 focus:ring-toyota/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Kata sandi
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota focus:ring-2 focus:ring-toyota/20"
          />
        </div>

        {error && <p className="text-sm text-toyota">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark disabled:opacity-60"
        >
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
