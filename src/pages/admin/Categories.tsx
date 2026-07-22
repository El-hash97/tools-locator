import { useState, type FormEvent } from 'react'
import { useData } from '@/data/DataProvider'
import { AdminLayout } from './AdminLayout'
import type { Category } from '@/data/types'

export default function AdminCategories() {
  const { categories, repo, refresh } = useData()
  const [nama, setNama] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function tambah(event: FormEvent) {
    event.preventDefault()
    if (nama.trim() === '') {
      setError('Nama kategori wajib diisi')
      return
    }
    setError(null)
    try {
      await repo.saveCategory({ nama: nama.trim() })
      await refresh()
      setNama('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    }
  }

  async function hapus(category: Category) {
    if (!window.confirm(`Hapus kategori "${category.nama}"?`)) return
    setError(null)
    try {
      await repo.deleteCategory(category.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-4 text-lg font-bold">Kelola Kategori</h1>

      <form
        onSubmit={tambah}
        className="mb-4 rounded-xl bg-white p-4 ring-1 ring-neutral-200"
      >
        <label htmlFor="nama-kategori" className="mb-1 block text-sm font-medium">
          Nama kategori
        </label>
        <div className="flex gap-2">
          <input
            id="nama-kategori"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
          />
          <button
            type="submit"
            // h-12 = 48px, memenuhi batas minimal 44px target sentuh.
            className="h-12 rounded-xl bg-toyota px-5 font-semibold text-white active:bg-toyota-dark"
          >
            Tambah
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-toyota">{error}</p>}
      </form>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200"
          >
            <p className="min-w-0 flex-1 truncate font-medium">{category.nama}</p>
            <button
              type="button"
              onClick={() => hapus(category)}
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
