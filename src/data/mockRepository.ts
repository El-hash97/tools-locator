import type {
  Category,
  CategoryInput,
  Location,
  LocationInput,
  Tool,
  ToolInput,
  Zone,
  ZoneInput,
} from './types'
import type { ToolRepository } from './repository'
import { seedCategories, seedLocations, seedTools, seedZones } from './seed'

export const STORAGE_KEY = 'tool-locator:data:v1'

type Db = {
  tools: Tool[]
  categories: Category[]
  locations: Location[]
  zones: Zone[]
}

function save(db: Db): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    throw new Error(
      'Penyimpanan browser penuh. Hapus foto atau tools lama sebelum menyimpan lagi.',
    )
  }
}

function load(): Db {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    // Salin, jangan pakai array seed langsung: `push` di saveTool akan
    // mengubah array asli di modul seed secara permanen, sehingga reseed
    // berikutnya membawa data lama, bukan seed sebenarnya.
    const initial: Db = {
      tools: [...seedTools],
      categories: [...seedCategories],
      locations: [...seedLocations],
      zones: [...seedZones],
    }
    save(initial)
    return initial
  }
  const db = JSON.parse(raw) as Db
  // Penyimpanan yang dibuat sebelum fitur denah tidak punya `zones`. Diisi
  // ulang dari seed, bukan dengan menaikkan STORAGE_KEY — menaikkan kunci
  // akan membuang tools yang sudah diinput admin.
  if (!db.zones) {
    db.zones = [...seedZones]
    // Lokasi bawaan yang tersimpan sebelum fitur ini belum punya `zone_id`;
    // tanpa ini semua tools tampil "belum dipetakan" di denah. Lokasi buatan
    // admin dibiarkan kosong — titiknya dipilih sendiri di menu Lokasi.
    db.locations = db.locations.map((l) =>
      l.zone_id
        ? l
        : { ...l, zone_id: seedLocations.find((s) => s.id === l.id)?.zone_id },
    )
    save(db)
  }
  // `warna` selalu diambil ulang dari seed: warnanya mengikuti gambar dan tidak
  // pernah bisa diubah admin, jadi penyimpanan lama tidak boleh menahan warna
  // basi saat gambar atau nilai warnanya dikoreksi.
  db.zones = db.zones.map((z) => ({
    ...z,
    warna: seedZones.find((s) => s.id === z.id)?.warna ?? z.warna,
  }))
  return db
}

function newId(): string {
  return crypto.randomUUID()
}

export class MockRepository implements ToolRepository {
  async getTools(): Promise<Tool[]> {
    return load().tools
  }

  async getTool(id: string): Promise<Tool | null> {
    return load().tools.find((t) => t.id === id) ?? null
  }

  async saveTool(input: ToolInput): Promise<Tool> {
    const db = load()
    if (input.id) {
      const index = db.tools.findIndex((t) => t.id === input.id)
      if (index === -1) throw new Error('Tools tidak ditemukan')
      const updated: Tool = { ...db.tools[index], ...input, id: input.id }
      db.tools[index] = updated
      save(db)
      return updated
    }
    const id = newId()
    const created: Tool = { ...input, id, qr_value: id }
    db.tools.push(created)
    save(db)
    return created
  }

  async deleteTool(id: string): Promise<void> {
    const db = load()
    db.tools = db.tools.filter((t) => t.id !== id)
    save(db)
  }

  async getCategories(): Promise<Category[]> {
    return load().categories
  }

  async saveCategory(input: CategoryInput): Promise<Category> {
    const db = load()
    if (input.id) {
      const index = db.categories.findIndex((c) => c.id === input.id)
      if (index === -1) throw new Error('Kategori tidak ditemukan')
      const updated: Category = { ...db.categories[index], ...input, id: input.id }
      db.categories[index] = updated
      save(db)
      return updated
    }
    const created: Category = { ...input, id: newId() }
    db.categories.push(created)
    save(db)
    return created
  }

  async deleteCategory(id: string): Promise<void> {
    const db = load()
    const used = db.tools.filter((t) => t.category_id === id).length
    if (used > 0) {
      throw new Error(
        `Kategori masih dipakai ${used} tools. Pindahkan tools tersebut lebih dulu.`,
      )
    }
    db.categories = db.categories.filter((c) => c.id !== id)
    save(db)
  }

  async getLocations(): Promise<Location[]> {
    return load().locations
  }

  async saveLocation(input: LocationInput): Promise<Location> {
    const db = load()
    if (input.id) {
      const index = db.locations.findIndex((l) => l.id === input.id)
      if (index === -1) throw new Error('Lokasi tidak ditemukan')
      const updated: Location = { ...db.locations[index], ...input, id: input.id }
      db.locations[index] = updated
      save(db)
      return updated
    }
    const created: Location = { ...input, id: newId() }
    db.locations.push(created)
    save(db)
    return created
  }

  async deleteLocation(id: string): Promise<void> {
    const db = load()
    const used = db.tools.filter((t) => t.location_id === id).length
    if (used > 0) {
      throw new Error(
        `Lokasi masih dipakai ${used} tools. Pindahkan tools tersebut lebih dulu.`,
      )
    }
    db.locations = db.locations.filter((l) => l.id !== id)
    save(db)
  }

  async getZones(): Promise<Zone[]> {
    return load().zones
  }

  async saveZone(input: ZoneInput): Promise<Zone> {
    const db = load()
    const index = db.zones.findIndex((z) => z.id === input.id)
    if (index === -1) throw new Error('Titik denah tidak ditemukan')
    // `warna` sengaja tidak ikut ditimpa: warnanya sudah tercetak di gambar.
    const updated: Zone = { ...db.zones[index], ...input }
    db.zones[index] = updated
    save(db)
    return updated
  }
}
