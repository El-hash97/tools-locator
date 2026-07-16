export type Category = {
  id: string
  nama: string
  deskripsi?: string
}

export type Location = {
  id: string
  area: string // Melting, Pouring, Analysis
  rak: string // Rak A, Rak B
  level_bin: string // Level 2, Bin 3
  deskripsi?: string
}

export type Tool = {
  id: string
  nama: string
  deskripsi?: string
  category_id: string
  location_id: string
  jumlah: number
  foto_tools_url?: string
  foto_penempatan_url?: string
  qr_value: string // berisi id tools
  keterangan?: string
}

export type AdminSession = {
  email: string
}

// `id` opsional: ada saat mengubah, kosong saat menambah.
// `qr_value` tidak pernah diinput manual — selalu dibuat repository.
export type ToolInput = Omit<Tool, 'id' | 'qr_value'> & { id?: string }
export type CategoryInput = Omit<Category, 'id'> & { id?: string }
export type LocationInput = Omit<Location, 'id'> & { id?: string }
