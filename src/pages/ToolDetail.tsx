import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Package } from 'lucide-react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>()
  const { tools, categories, locations, loading } = useData()

  if (loading) return <p className="p-6 text-center text-neutral-500">Memuat…</p>

  const tool = tools.find((t) => t.id === id)

  if (!tool) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="mb-4 text-lg font-semibold text-neutral-900">
          Tools tidak ditemukan
        </p>
        <p className="mb-6 text-sm text-neutral-500">
          Data mungkin sudah dihapus admin.
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

  const category = categories.find((c) => c.id === tool.category_id)
  const location = locations.find((l) => l.id === tool.location_id)

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <header className="flex items-center gap-2 px-4 py-4">
        <Link
          to="/"
          aria-label="Kembali"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 active:bg-neutral-200"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="truncate text-lg font-bold">{tool.nama}</h1>
      </header>

      <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-neutral-100">
        {tool.foto_tools_url ? (
          <img
            src={tool.foto_tools_url}
            alt={tool.nama}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-neutral-400" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-4 px-4 pt-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-700">
            {category?.nama ?? 'Tanpa kategori'}
          </span>
          <span className="rounded-full bg-toyota/10 px-3 py-1 text-sm font-semibold text-toyota">
            {tool.jumlah} pcs
          </span>
        </div>

        {tool.deskripsi && <p className="text-neutral-700">{tool.deskripsi}</p>}

        <div className="rounded-xl bg-white p-4 ring-1 ring-neutral-200">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Lokasi penempatan
          </p>
          <p className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <MapPin className="h-5 w-5 text-toyota" aria-hidden="true" />
            {formatLocation(location)}
          </p>
        </div>

        {tool.keterangan && (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            {tool.keterangan}
          </div>
        )}

        <Link
          to={`/return/${tool.id}`}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-toyota text-base font-semibold text-white active:bg-toyota-dark"
        >
          Lihat penempatan
        </Link>
      </div>
    </div>
  )
}
