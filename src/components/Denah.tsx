import type { Zone } from '@/data/types'

// Titik-titik berwarna sudah tercetak di gambar. Komponen ini hanya menimpa
// satu titik berkedip di atas titik cetak itu saat sebuah zona disorot.
export function Denah({
  zones,
  highlightId,
}: {
  zones: Zone[]
  highlightId?: string
}) {
  const highlight = zones.find((z) => z.id === highlightId)

  return (
    // Denah padat teks; di layar HP dipaksa lebar minimum lalu digeser
    // mendatar, bukan dikecilkan sampai tak terbaca.
    <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-neutral-200">
      <div className="relative min-w-[640px]">
        <img src="/denah.jpg" alt="Denah area kerja" className="block w-full" />
        {highlight && (
          <span
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${highlight.x}%`, top: `${highlight.y}%` }}
            data-testid="denah-highlight"
          >
            <ZoneBullet warna={highlight.warna} berkedip size="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  )
}

export function DenahLegend({
  zones,
  activeId,
}: {
  zones: Zone[]
  activeId?: string
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
      {zones.map((zone) => {
        const active = zone.id === activeId
        return (
          <li key={zone.id} className="flex items-center gap-2">
            <ZoneBullet warna={zone.warna} berkedip={active} />
            <span
              className={`min-w-0 truncate text-sm ${
                active ? 'font-semibold text-neutral-900' : 'text-neutral-700'
              }`}
            >
              {zone.nama}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function ZoneBullet({
  warna,
  berkedip = false,
  size = 'h-3.5 w-3.5',
}: {
  warna: string
  berkedip?: boolean
  size?: string
}) {
  return (
    <span className={`relative flex shrink-0 ${size}`}>
      {berkedip && (
        // Halo tetap berdenyut samar sebagai penanda area.
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: warna }}
          aria-hidden="true"
        />
      )}
      <span
        className={`relative inline-flex h-full w-full rounded-full ring-1 ring-white ${
          // Titik utama kedip: hilang total lalu muncul, biar posisinya jelas.
          berkedip ? 'denah-blink' : ''
        }`}
        style={{ backgroundColor: warna }}
        aria-hidden="true"
      />
    </span>
  )
}
