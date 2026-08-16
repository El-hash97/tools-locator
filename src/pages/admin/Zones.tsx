import { useState, type FormEvent } from 'react'
import { useData } from '@/data/DataProvider'
import { Denah, ZoneBullet } from '@/components/Denah'
import { AdminLayout } from './AdminLayout'
import type { Zone } from '@/data/types'

export default function AdminZones() {
  const { zones, repo, refresh } = useData()
  const [error, setError] = useState<string | null>(null)
  const [tersimpan, setTersimpan] = useState<string | null>(null)
  const [pratinjau, setPratinjau] = useState<string | undefined>(undefined)

  async function simpan(zone: Zone, nama: string, x: number, y: number) {
    if (nama.trim() === '') {
      setError('Nama keterangan wajib diisi')
      return
    }
    setError(null)
    try {
      await repo.saveZone({ id: zone.id, nama: nama.trim(), x, y })
      await refresh()
      setTersimpan(zone.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-1 text-lg font-bold">Keterangan Denah</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Warna mengikuti titik yang sudah tercetak di denah, jadi tidak bisa
        diubah. Namanya bebas diubah, dan posisi titik bisa digeser bila
        kedipannya meleset dari titik aslinya.
      </p>

      <div className="mb-4">
        <Denah zones={zones} highlightId={pratinjau} />
      </div>

      {error && <p className="mb-3 text-sm text-toyota">{error}</p>}

      <ul className="space-y-2">
        {zones.map((zone) => (
          <ZoneRow
            key={zone.id}
            zone={zone}
            tersimpan={tersimpan === zone.id}
            onFocus={() => setPratinjau(zone.id)}
            onSubmit={simpan}
          />
        ))}
      </ul>
    </AdminLayout>
  )
}

function ZoneRow({
  zone,
  tersimpan,
  onFocus,
  onSubmit,
}: {
  zone: Zone
  tersimpan: boolean
  onFocus: () => void
  onSubmit: (zone: Zone, nama: string, x: number, y: number) => Promise<void>
}) {
  const [nama, setNama] = useState(zone.nama)
  const [x, setX] = useState(String(zone.x))
  const [y, setY] = useState(String(zone.y))

  function kirim(event: FormEvent) {
    event.preventDefault()
    // Nilai kosong / bukan angka jatuh kembali ke posisi lama, bukan ke NaN
    // yang membuat titik berkedip hilang dari denah.
    const angka = (nilai: string, cadangan: number) =>
      nilai.trim() !== '' && Number.isFinite(Number(nilai))
        ? Number(nilai)
        : cadangan
    void onSubmit(zone, nama, angka(x, zone.x), angka(y, zone.y))
  }

  return (
    <li className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
      <form
        onSubmit={kirim}
        onFocus={onFocus}
        className="flex flex-wrap items-end gap-2"
      >
        <span className="flex h-12 items-center pr-1">
          <ZoneBullet warna={zone.warna} size="h-6 w-6" />
        </span>

        <div className="min-w-40 flex-1">
          <label
            htmlFor={`nama-${zone.id}`}
            className="mb-1 block text-sm font-medium"
          >
            Nama keterangan
          </label>
          <input
            id={`nama-${zone.id}`}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            // h-12 = 48px, memenuhi batas minimal 44px target sentuh.
            className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
          />
        </div>

        <div className="w-20">
          <label htmlFor={`x-${zone.id}`} className="mb-1 block text-sm font-medium">
            X (%)
          </label>
          <input
            id={`x-${zone.id}`}
            type="number"
            step="0.1"
            value={x}
            onChange={(e) => setX(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
          />
        </div>

        <div className="w-20">
          <label htmlFor={`y-${zone.id}`} className="mb-1 block text-sm font-medium">
            Y (%)
          </label>
          <input
            id={`y-${zone.id}`}
            type="number"
            step="0.1"
            value={y}
            onChange={(e) => setY(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
          />
        </div>

        <button
          type="submit"
          className="h-12 rounded-xl bg-toyota px-4 font-semibold text-white active:bg-toyota-dark"
        >
          {tersimpan ? 'Tersimpan' : 'Simpan'}
        </button>
      </form>
    </li>
  )
}
