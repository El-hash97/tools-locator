import type {
  Category,
  CategoryInput,
  Location,
  LocationInput,
  Tool,
  ToolInput,
} from './types'
import type { ToolRepository } from './repository'
import { seedCategories, seedLocations, seedTools } from './seed'

export const STORAGE_KEY = 'tool-locator:data:v1'

type Db = {
  tools: Tool[]
  categories: Category[]
  locations: Location[]
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
    }
    save(initial)
    return initial
  }
  return JSON.parse(raw) as Db
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
}
