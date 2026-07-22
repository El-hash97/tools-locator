import { useState, type FormEvent } from 'react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'
import { AdminLayout } from './AdminLayout'
import type { Location } from '@/data/types'

export default function AdminLocations() {
  const { locations, repo, refresh } = useData()
  const [area, setArea] = useState('')
  const [rak, setRak] = useState('')
  const [levelBin, setLevelBin] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function tambah(event: FormEvent) {
    event.preventDefault()
    if (area.trim() === '' || rak.trim() === '' || levelBin.trim() === '') {
      setError('Area, rak, dan level / bin wajib diisi')
      return
    }
    setError(null)
    try {
      await repo.saveLocation({
        area: area.trim(),
        rak: rak.trim(),
        level_bin: levelBin.trim(),
      })
      await refresh()
      setArea('')
      setRak('')
      setLevelBin('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    }
  }

  async function hapus(location: Location) {
    if (!window.confirm(`Hapus lokasi "${formatLocation(location)}"?`)) return
    setError(null)
    try {
      await repo.deleteLocation(location.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-4 text-lg font-bold">Kelola Lokasi</h1>

      <form
        onSubmit={tambah}
        className="mb-4 space-y-3 rounded-xl bg-white p-4 ring-1 ring-neutral-200"
      >
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="area" className="mb-1 block text-sm font-medium">
              Area
            </label>
            <input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Melting"
              // h-12 = 48px, memenuhi batas minimal 44px target sentuh.
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>
          <div>
            <label htmlFor="rak" className="mb-1 block text-sm font-medium">
              Rak
            </label>
            <input
              id="rak"
              value={rak}
              onChange={(e) => setRak(e.target.value)}
              placeholder="Rak A"
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>
          <div>
            <label htmlFor="level-bin" className="mb-1 block text-sm font-medium">
              Level / Bin
            </label>
            <input
              id="level-bin"
              value={levelBin}
              onChange={(e) => setLevelBin(e.target.value)}
              placeholder="Level 2"
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>
        </div>

        {error && <p className="text-sm text-toyota">{error}</p>}

        <button
          type="submit"
          // h-12 = 48px, memenuhi batas minimal 44px target sentuh.
          className="h-12 w-full rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark"
        >
          Tambah lokasi
        </button>
      </form>

      <ul className="space-y-2">
        {locations.map((location) => (
          <li
            key={location.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200"
          >
            <p className="min-w-0 flex-1 truncate font-medium">
              {formatLocation(location)}
            </p>
            <button
              type="button"
              onClick={() => hapus(location)}
              // h-11 = 44px: batas minimal target sentuh.
              className="h-11 rounded-lg px-3 text-sm font-medium text-toyota ring-1 ring-toyota/30"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}
