import { useMemo, useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'
import { buildQrUrl } from '@/lib/qr'
import { AdminLayout } from './AdminLayout'
import { PhotoInput } from '@/components/PhotoInput'
import type { Tool, ToolInput } from '@/data/types'

const kosong: ToolInput = {
  nama: '',
  deskripsi: '',
  category_id: '',
  location_id: '',
  jumlah: 1,
  keterangan: '',
}

export default function AdminTools() {
  const { tools, categories, locations, repo, refresh } = useData()
  const [draft, setDraft] = useState<ToolInput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [area, setArea] = useState('')
  const [rak, setRak] = useState('')

  const areas = useMemo(
    () => [...new Set(locations.map((l) => l.area))],
    [locations],
  )
  const raks = useMemo(
    () => [...new Set(locations.filter((l) => l.area === area).map((l) => l.rak))],
    [locations, area],
  )
  const bins = useMemo(
    () => locations.filter((l) => l.area === area && l.rak === rak),
    [locations, area, rak],
  )

  function mulaiTambah() {
    setDraft({ ...kosong })
    setArea('')
    setRak('')
    setError(null)
  }

  function mulaiUbah(tool: Tool) {
    const { id, qr_value: _qrValue, ...rest } = tool
    setDraft({ ...rest, id })
    const location = locations.find((l) => l.id === tool.location_id)
    setArea(location?.area ?? '')
    setRak(location?.rak ?? '')
    setError(null)
  }

  async function simpan(event: FormEvent) {
    event.preventDefault()
    if (!draft) return

    if (draft.nama.trim() === '') {
      setError('Nama tools wajib diisi')
      return
    }
    if (draft.category_id === '') {
      setError('Kategori wajib dipilih')
      return
    }
    if (draft.location_id === '') {
      setError('Lokasi wajib dipilih sampai Level / Bin')
      return
    }
    if (!Number.isFinite(draft.jumlah) || draft.jumlah < 1) {
      setError('Jumlah minimal 1')
      return
    }

    try {
      await repo.saveTool(draft)
      await refresh()
      setDraft(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    }
  }

  async function hapus(tool: Tool) {
    if (!window.confirm(`Hapus "${tool.nama}"?`)) return
    try {
      await repo.deleteTool(tool.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Kelola Tools</h1>
        <button
          type="button"
          onClick={mulaiTambah}
          // h-11 = 44px: batas minimal target sentuh.
          className="h-11 rounded-xl bg-toyota px-4 text-sm font-semibold text-white active:bg-toyota-dark"
        >
          Tambah tools
        </button>
      </div>

      {draft && (
        // noValidate: field jumlah memakai type="number" min={1}. Tanpa ini,
        // validasi bawaan browser memblokir submit sebelum simpan() sempat
        // jalan — pesan "Jumlah minimal 1" milik aplikasi tidak pernah
        // muncul, digantikan tooltip browser yang tidak konsisten dan tidak
        // berbahasa Indonesia di HP Android.
        <form
          onSubmit={simpan}
          noValidate
          className="mb-6 space-y-4 rounded-xl bg-white p-4 ring-1 ring-neutral-200"
        >
          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-medium">
              Nama tools
            </label>
            <input
              id="nama"
              value={draft.nama}
              onChange={(e) => setDraft({ ...draft, nama: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          <div>
            <label htmlFor="deskripsi" className="mb-1 block text-sm font-medium">
              Deskripsi
            </label>
            <input
              id="deskripsi"
              value={draft.deskripsi ?? ''}
              onChange={(e) => setDraft({ ...draft, deskripsi: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          <div>
            <label htmlFor="kategori" className="mb-1 block text-sm font-medium">
              Kategori
            </label>
            <select
              id="kategori"
              value={draft.category_id}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3"
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="area" className="mb-1 block text-sm font-medium">
                Area
              </label>
              <select
                id="area"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value)
                  setRak('')
                  setDraft({ ...draft, location_id: '' })
                }}
                className="h-12 w-full rounded-xl border border-neutral-200 px-2"
              >
                <option value="">Pilih</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rak" className="mb-1 block text-sm font-medium">
                Rak
              </label>
              <select
                id="rak"
                value={rak}
                disabled={area === ''}
                onChange={(e) => {
                  setRak(e.target.value)
                  setDraft({ ...draft, location_id: '' })
                }}
                className="h-12 w-full rounded-xl border border-neutral-200 px-2 disabled:bg-neutral-100"
              >
                <option value="">Pilih</option>
                {raks.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bin" className="mb-1 block text-sm font-medium">
                Level / Bin
              </label>
              <select
                id="bin"
                value={draft.location_id}
                disabled={rak === ''}
                onChange={(e) => setDraft({ ...draft, location_id: e.target.value })}
                className="h-12 w-full rounded-xl border border-neutral-200 px-2 disabled:bg-neutral-100"
              >
                <option value="">Pilih</option>
                {bins.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.level_bin}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="jumlah" className="mb-1 block text-sm font-medium">
              Jumlah
            </label>
            <input
              id="jumlah"
              type="number"
              min={1}
              value={draft.jumlah}
              onChange={(e) =>
                setDraft({ ...draft, jumlah: Number(e.target.value) })
              }
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          <PhotoInput
            label="Foto tools"
            value={draft.foto_tools_url}
            onChange={(url) => setDraft({ ...draft, foto_tools_url: url })}
          />

          <PhotoInput
            label="Foto penempatan"
            value={draft.foto_penempatan_url}
            onChange={(url) => setDraft({ ...draft, foto_penempatan_url: url })}
          />

          <div>
            <label htmlFor="keterangan" className="mb-1 block text-sm font-medium">
              Keterangan
            </label>
            <input
              id="keterangan"
              value={draft.keterangan ?? ''}
              onChange={(e) => setDraft({ ...draft, keterangan: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          {draft.id && (
            <div className="rounded-xl bg-neutral-50 p-4 text-center">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Pratinjau QR
              </p>
              <div data-testid="qr-preview" className="inline-block bg-white p-2">
                <QRCodeSVG
                  value={buildQrUrl(window.location.origin, draft.id)}
                  size={120}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-toyota">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="h-12 flex-1 rounded-xl bg-white font-semibold text-neutral-700 ring-1 ring-neutral-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-12 flex-1 rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {tools.map((tool) => (
          <li
            key={tool.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{tool.nama}</p>
              <p className="truncate text-xs text-neutral-500">
                {formatLocation(locations.find((l) => l.id === tool.location_id))}
                {' · '}
                {tool.jumlah} pcs
              </p>
            </div>
            <button
              type="button"
              onClick={() => mulaiUbah(tool)}
              // h-11 = 44px: batas minimal target sentuh.
              className="h-11 rounded-lg px-3 text-sm font-medium text-neutral-700 ring-1 ring-neutral-300"
            >
              Ubah
            </button>
            <button
              type="button"
              onClick={() => hapus(tool)}
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
