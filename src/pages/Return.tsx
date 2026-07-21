import { Link, useParams } from 'react-router-dom'
import { ImageOff, MapPin } from 'lucide-react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'

export default function Return() {
  const { id } = useParams<{ id: string }>()
  const { tools, locations, loading, error } = useData()

  if (loading) return <p className="p-6 text-center text-neutral-500">Memuat…</p>

  // Diperiksa SEBELUM "tidak ditemukan": tanpa ini, MP yang baru saja scan QR
  // untuk mengembalikan tools akan melihat "QR ini tidak dikenali" saat
  // sebenarnya penyimpanan gagal dimuat — pesan yang salah dan menyesatkan
  // persis di momen paling penting (mengembalikan tools).
  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="mb-4 text-lg font-semibold text-neutral-900">
          Gagal memuat data
        </p>
        <p className="mb-6 text-sm text-neutral-500">{error}</p>
        <Link
          to="/"
          className="inline-flex h-12 items-center rounded-xl bg-toyota px-5 font-semibold text-white"
        >
          Kembali ke pencarian
        </Link>
      </div>
    )
  }

  const tool = tools.find((t) => t.id === id)

  if (!tool) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="mb-4 text-lg font-semibold text-neutral-900">
          Tools tidak ditemukan
        </p>
        <p className="mb-6 text-sm text-neutral-500">
          QR ini tidak dikenali. Data mungkin sudah dihapus admin.
        </p>
        <Link
          to="/"
          className="inline-flex h-12 items-center rounded-xl bg-toyota px-5 font-semibold text-white"
        >
          Kembali ke pencarian
        </Link>
      </div>
    )
  }

  const location = locations.find((l) => l.id === tool.location_id)

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="bg-toyota px-4 py-5 text-center text-white">
        <p className="text-2xl font-bold uppercase tracking-wide">
          Kembalikan ke sini
        </p>
        <p className="mt-1 text-white/90">{tool.nama}</p>
      </div>

      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-neutral-200">
        {tool.foto_penempatan_url ? (
          <img
            src={tool.foto_penempatan_url}
            alt={`Penempatan ${tool.nama}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <ImageOff className="h-12 w-12" aria-hidden="true" />
            <p className="text-sm">Foto penempatan belum diunggah</p>
          </div>
        )}
      </div>

      <div className="px-4 pt-5">
        <div className="rounded-xl bg-white p-5 text-center ring-1 ring-neutral-200">
          <p className="mb-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            <MapPin className="h-4 w-4 text-toyota" aria-hidden="true" />
            Lokasi
          </p>
          <p className="text-2xl font-bold leading-tight text-neutral-900">
            {formatLocation(location)}
          </p>
        </div>

        {tool.keterangan && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-900 ring-1 ring-amber-200">
            {tool.keterangan}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            to={`/tools/${tool.id}`}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-white font-semibold text-neutral-700 ring-1 ring-neutral-300"
          >
            Detail
          </Link>
          <Link
            to="/scan"
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark"
          >
            Scan lagi
          </Link>
        </div>
      </div>
    </div>
  )
}
