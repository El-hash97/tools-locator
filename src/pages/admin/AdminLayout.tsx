import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'

const tabs = [
  { to: '/admin/tools', label: 'Tools' },
  { to: '/admin/categories', label: 'Kategori' },
  { to: '/admin/locations', label: 'Lokasi' },
  { to: '/admin/labels', label: 'Label QR' },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function keluar() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <header className="px-4 pt-5">
        <div className="flex items-center justify-between">
          {/* h-11 = 44px: judul dijadikan tautan ke beranda, jadi ikut
              batas minimal target sentuh seperti tautan lain di aplikasi. */}
          <Link to="/" className="flex h-11 items-center text-lg font-bold">
            Panel <span className="text-toyota">Admin</span>
          </Link>
          <button
            type="button"
            onClick={keluar}
            // h-11 = 44px: batas minimal target sentuh. MP memakai sarung tangan.
            className="flex h-11 items-center gap-2 rounded-full px-3 text-sm text-neutral-600 active:bg-neutral-200"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Keluar
          </button>
        </div>

        <nav className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                // h-11 = 44px: batas minimal target sentuh untuk tab navigasi.
                `flex h-11 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium ${
                  isActive
                    ? 'bg-toyota text-white'
                    : 'bg-white text-neutral-700 ring-1 ring-neutral-200'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-4 pt-4">{children}</main>
    </div>
  )
}
