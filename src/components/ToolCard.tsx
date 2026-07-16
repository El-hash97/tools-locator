import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import type { Tool } from '@/data/types'

type Props = {
  tool: Tool
  categoryName: string
  locationLabel: string
}

export function ToolCard({ tool, categoryName, locationLabel }: Props) {
  return (
    <Link
      to={`/tools/${tool.id}`}
      className="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-neutral-200 active:bg-neutral-50"
    >
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
        {tool.foto_tools_url ? (
          <img
            src={tool.foto_tools_url}
            alt={tool.nama}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-8 w-8 text-neutral-400" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-neutral-900">
          {tool.nama}
        </p>
        <p className="truncate text-sm text-neutral-500">{categoryName}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full bg-toyota/10 px-2 py-0.5 text-xs font-semibold text-toyota">
            {tool.jumlah} pcs
          </span>
          <span className="truncate text-xs text-neutral-600">{locationLabel}</span>
        </div>
      </div>
    </Link>
  )
}
