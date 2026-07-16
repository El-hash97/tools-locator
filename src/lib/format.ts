import type { Location } from '@/data/types'

export function formatLocation(location: Location | undefined): string {
  if (!location) return 'Lokasi belum diatur'
  return `${location.area} · ${location.rak} · ${location.level_bin}`
}
