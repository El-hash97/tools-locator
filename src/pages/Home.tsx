import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Settings } from 'lucide-react'
import { useData } from '@/data/DataProvider'
import { searchByName } from '@/lib/fuzzy'
import { formatLocation } from '@/lib/format'
import { ToolCard } from '@/components/ToolCard'
import { ScanFab } from '@/components/ScanFab'

export default function Home() {
  const { tools, categories, locations, loading, error } = useData()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const visible = useMemo(() => {
    const byCategory = categoryId
      ? tools.filter((t) => t.category_id === categoryId)
      : tools
    return searchByName(byCategory, query, (t) => t.nama)
  }, [tools, query, categoryId])

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.nama ?? 'Tanpa kategori'

  const locationLabel = (id: string) =>
    formatLocation(locations.find((l) => l.id === id))

  return (
    <div className="mx-auto min-h-full max-w-2xl pb-28">
      <header className="sticky top-0 z-10 bg-neutral-50/95 px-4 pb-3 pt-5 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-neutral-900">
            Tool <span className="text-toyota">Locator</span>
          </h1>
          <Link
            to="/admin"
            aria-label="Panel admin"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-200"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tools…"
            aria-label="Cari tools"
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-base outline-none focus:border-toyota focus:ring-2 focus:ring-toyota/20"
          />
        </div>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <CategoryChip
            label="Semua"
            active={categoryId === null}
            onClick={() => setCategoryId(null)}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.nama}
              active={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
            />
          ))}
        </div>
      </header>

      <main className="space-y-2 px-4 pt-2">
        {loading && <p className="py-8 text-center text-neutral-500">Memuat…</p>}
        {error && <p className="py-8 text-center text-toyota">{error}</p>}

        {!loading && !error && visible.length === 0 && (
          <p className="py-12 text-center text-neutral-500">
            Tools tidak ditemukan. Coba kata lain.
          </p>
        )}

        {visible.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            categoryName={categoryName(tool.category_id)}
            locationLabel={locationLabel(tool.location_id)}
          />
        ))}
      </main>

      <ScanFab />
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium ${
        active
          ? 'bg-toyota text-white'
          : 'bg-white text-neutral-700 ring-1 ring-neutral-200'
      }`}
    >
      {label}
    </button>
  )
}
