import type { Category, Location, Tool, Zone } from './types'

// Kredensial pengembangan untuk fase mock. Bukan kontrol keamanan —
// siapa pun yang membuka berkas sumber bisa membacanya. Dibuang seluruhnya
// saat Supabase Auth masuk.
export const ADMIN_CREDENTIAL = {
  email: 'admin@tmmin.local',
  password: 'admin123',
}

export const seedCategories: Category[] = [
  { id: 'cat-kunci', nama: 'Kunci & Tang', deskripsi: 'Alat bongkar pasang' },
  { id: 'cat-ukur', nama: 'Alat Ukur', deskripsi: 'Alat ukur & analisa' },
  { id: 'cat-apd', nama: 'Alat Pelindung Diri', deskripsi: 'APD area panas' },
  { id: 'cat-pouring', nama: 'Alat Pouring', deskripsi: 'Alat area pouring' },
]

// Warna diambil dari titik yang sudah tercetak di public/denah.jpg; `x`/`y`
// persen posisi titik tersebut, ditakar dari gambar dan bisa dikoreksi admin.
// Warna disalin dari piksel titik yang bersangkutan di public/denah.jpg, jadi
// bulatan keterangan sama persis dengan titik di gambar. `x`/`y` persen posisi
// titik tersebut — sudah dicek jatuh tepat di atas titiknya, dan tetap bisa
// dikoreksi admin bila gambar denah diganti.
export const seedZones: Zone[] = [
  { id: 'zone-biru', nama: 'Lemari Tools', warna: '#304FFF', x: 24.5, y: 98 },
  { id: 'zone-merah', nama: 'Lemari Bawah Tangga', warna: '#D50100', x: 44.1, y: 89.6 },
  { id: 'zone-hijau-muda', nama: 'Tempat 3', warna: '#C6FF00', x: 60, y: 82 },
  { id: 'zone-biru-muda', nama: 'Pemberat', warna: '#80D8FE', x: 63.1, y: 82 },
  { id: 'zone-hitam', nama: 'Tempat 5', warna: '#424242', x: 66.7, y: 82.1 },
  { id: 'zone-ungu', nama: 'Lemari Relining Ladle', warna: '#AA00FF', x: 96.7, y: 37.3 },
]

export const seedLocations: Location[] = [
  {
    id: 'loc-melting-a1',
    area: 'Melting',
    rak: 'Rak A',
    level_bin: 'Level 1',
    zone_id: 'zone-biru',
  },
  {
    id: 'loc-melting-a2',
    area: 'Melting',
    rak: 'Rak A',
    level_bin: 'Level 2',
    zone_id: 'zone-merah',
  },
  {
    id: 'loc-pouring-b1',
    area: 'Pouring',
    rak: 'Rak B',
    level_bin: 'Level 1',
    zone_id: 'zone-hijau-muda',
  },
  {
    id: 'loc-pouring-b3',
    area: 'Pouring',
    rak: 'Rak B',
    level_bin: 'Bin 3',
    zone_id: 'zone-hitam',
  },
  {
    id: 'loc-analysis-c1',
    area: 'Analysis',
    rak: 'Rak C',
    level_bin: 'Level 1',
    zone_id: 'zone-ungu',
  },
]

export const seedTools: Tool[] = [
  {
    id: 'tool-001',
    nama: 'Kunci Pas 12',
    deskripsi: 'Kunci pas ukuran 12 mm',
    category_id: 'cat-kunci',
    location_id: 'loc-melting-a1',
    jumlah: 4,
    qr_value: 'tool-001',
    keterangan: 'Kembalikan dalam keadaan bersih',
  },
  {
    id: 'tool-002',
    nama: 'Tang Kombinasi',
    deskripsi: 'Tang kombinasi 8 inci',
    category_id: 'cat-kunci',
    location_id: 'loc-melting-a1',
    jumlah: 2,
    qr_value: 'tool-002',
  },
  {
    id: 'tool-003',
    nama: 'Palu Karet',
    deskripsi: 'Palu karet untuk cetakan',
    category_id: 'cat-kunci',
    location_id: 'loc-melting-a2',
    jumlah: 3,
    qr_value: 'tool-003',
  },
  {
    id: 'tool-004',
    nama: 'Sarung Tangan Tahan Panas',
    deskripsi: 'APD wajib area melting',
    category_id: 'cat-apd',
    location_id: 'loc-melting-a2',
    jumlah: 10,
    qr_value: 'tool-004',
    keterangan: 'Cek kondisi sebelum dipakai',
  },
  {
    id: 'tool-005',
    nama: 'Thermocouple Probe',
    deskripsi: 'Probe pengukur suhu logam cair',
    category_id: 'cat-ukur',
    location_id: 'loc-analysis-c1',
    jumlah: 2,
    qr_value: 'tool-005',
    keterangan: 'Barang sensitif — tangani hati-hati',
  },
  {
    id: 'tool-006',
    nama: 'Gelas Ukur Sampel',
    deskripsi: 'Gelas ukur untuk sampel analisa',
    category_id: 'cat-ukur',
    location_id: 'loc-analysis-c1',
    jumlah: 6,
    qr_value: 'tool-006',
  },
  {
    id: 'tool-007',
    nama: 'Ladle Skimmer',
    deskripsi: 'Alat pembersih terak pada ladle',
    category_id: 'cat-pouring',
    location_id: 'loc-pouring-b1',
    jumlah: 3,
    qr_value: 'tool-007',
  },
  {
    id: 'tool-008',
    nama: 'Sekop Pasir',
    deskripsi: 'Sekop untuk pasir cetak',
    category_id: 'cat-pouring',
    location_id: 'loc-pouring-b3',
    jumlah: 5,
    qr_value: 'tool-008',
  },
]
