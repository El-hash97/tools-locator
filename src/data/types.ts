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
  zone_id?: string // titik berwarna di denah
}

// Titik berwarna yang sudah tercetak di denah.jpg. Warnanya mengikuti gambar
// jadi tidak bisa diubah; hanya namanya yang diatur admin. `x`/`y` dalam persen
// — posisinya ditakar dari gambar, jadi disediakan agar bisa dikalibrasi admin.
export type Zone = {
  id: string
  nama: string
  warna: string
  x: number
  y: number
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
// Zone tidak pernah dibuat/dihapus lewat UI — titiknya sudah ada di gambar.
export type ZoneInput = Pick<Zone, 'id' | 'nama' | 'x' | 'y'>
