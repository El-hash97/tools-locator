# Tool Locator — Desain Fase Front End

- **Acuan:** PRD-TMMIN-TLOC-001 v1.0 (16 Juli 2026)
- **Tanggal desain:** 16 Juli 2026
- **Lingkup dokumen:** Fase 1 (MVP) — bagian front end saja, di atas data mock
- **Status:** Disetujui untuk masuk rencana implementasi

## 1. Tujuan Fase Ini

Membangun seluruh antarmuka Tool Locator sesuai PRD Fase 1, berjalan penuh di atas data mock di dalam browser, tanpa Supabase. Aplikasi harus bisa dipakai dan dinilai secara nyata di HP: cari tools, buka detail, scan QR, dan kelola data lewat panel admin.

Fase ini dianggap selesai ketika penukaran dari mock ke Supabase tidak menuntut perubahan pada satu pun komponen UI.

## 2. Keputusan Utama

| Keputusan | Isi | Alasan |
|---|---|---|
| Supabase ditunda | Semua data lewat `MockRepository` | UI bisa dinilai lebih awal tanpa kredensial |
| QR difungsikan penuh | Generate, cetak label, dan scan kamera semuanya bekerja sekarang | Bagian paling berisiko di lapangan; tidak butuh backend |
| Satu antarmuka data | `ToolRepository` | Menjaga penukaran ke Supabase terisolasi di satu berkas |
| Auth distub | `AuthProvider` meniru bentuk Supabase Auth | Alasan yang sama seperti di atas |

## 3. Tech Stack

Sesuai PRD bagian 9, konsisten dengan ekosistem Casting Tools Hub.

| Lapisan | Teknologi |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Komponen UI | Tailwind langsung + lucide-react (lihat catatan) |
| Routing | React Router |
| Generate QR | qrcode.react |
| Scan QR | html5-qrcode |
| Cetak label | react-to-print + CSS print |
| Pengujian | Vitest + React Testing Library |

Ditunda ke fase berikutnya: Supabase (PostgreSQL + Auth + RLS), Supabase Storage, Netlify.

**Catatan — menyimpang dari PRD bagian 9:** PRD menyebut shadcn/ui sebagai komponen UI. Fase ini memakai Tailwind langsung dengan komponen kecil buatan sendiri (`ToolCard`, `PhotoInput`, `CategoryChip`, `ScanFab`). shadcn/ui adalah pustaka salin-tempel, dan komponen yang aplikasi ini butuhkan sedikit serta sederhana — menariknya lewat CLI menambah `components.json`, dependensi Radix, dan berkas tak terpakai tanpa manfaat sepadan. Disetujui El pada 16 Juli 2026. Bila kelak konsistensi lintas aplikasi Casting Tools Hub menuntutnya, komponen-komponen ini kecil dan mudah diganti.

## 4. Arsitektur

### 4.1 Lapisan data

Seluruh akses data melewati satu antarmuka. Tidak ada komponen yang boleh menyentuh sumber data secara langsung.

```ts
interface ToolRepository {
  getTools(): Promise<Tool[]>
  getTool(id: string): Promise<Tool | null>
  saveTool(tool: ToolInput): Promise<Tool>
  deleteTool(id: string): Promise<void>

  getCategories(): Promise<Category[]>
  saveCategory(c: CategoryInput): Promise<Category>
  deleteCategory(id: string): Promise<void>

  getLocations(): Promise<Location[]>
  saveLocation(l: LocationInput): Promise<Location>
  deleteLocation(id: string): Promise<void>
}
```

Semua metode `async` sejak awal, meski implementasi mock sinkron — supaya bentuk pemanggilan di UI tidak berubah saat Supabase masuk.

`MockRepository` menyimpan data di `localStorage` dengan seed awal berisi tools contoh Casting Division. Tambah/ubah/hapus bertahan setelah refresh.

### 4.2 Autentikasi

`AuthProvider` menyediakan `signIn(email, password)`, `signOut()`, dan `session`. Rute `/admin/*` dijaga komponen `RequireAuth` yang mengalihkan ke `/admin` bila tidak ada sesi.

Implementasi stub menerima satu kredensial admin pengembangan yang didefinisikan di `seed.ts` (`admin@tmmin.local` / `admin123`) dan menyimpan sesi di `localStorage`. Kredensial ini semata alat bantu selama fase mock, bukan kontrol keamanan: siapa pun yang membuka berkas sumber bisa membacanya. Keamanan sebenarnya datang dari Supabase Auth + RLS di fase berikutnya, dan stub ini dibuang seluruhnya saat itu.

MP tidak login sama sekali (FR-D1).

### 4.3 Struktur berkas

```
src/
  data/
    types.ts           # Tool, Category, Location, User
    repository.ts      # antarmuka ToolRepository
    mockRepository.ts  # implementasi fase ini
    seed.ts            # data contoh awal
  auth/
    AuthProvider.tsx
    RequireAuth.tsx
  lib/
    fuzzy.ts           # pencocokan toleran typo
    image.ts           # kompresi foto
  pages/
    Home.tsx
    ToolDetail.tsx
    Scan.tsx
    Return.tsx
    admin/
      Login.tsx
      Tools.tsx
      Categories.tsx
      Locations.tsx
      Labels.tsx
  components/
    ...
```

## 5. Model Data

Mengikuti PRD bagian 7.1.

```ts
type Category = { id: string; nama: string; deskripsi?: string }

type Location = {
  id: string
  area: string       // Melting, Pouring, Analysis
  rak: string        // Rak A, Rak B
  level_bin: string  // Level 2, Bin 3
  deskripsi?: string
}

type Tool = {
  id: string
  nama: string
  deskripsi?: string
  category_id: string
  location_id: string
  jumlah: number
  foto_tools_url?: string
  foto_penempatan_url?: string
  qr_value: string   // berisi id tools
  keterangan?: string
}
```

Lokasi selalu dipilih lewat dropdown berjenjang Area → Rak → Level/Bin, tidak pernah teks bebas (PRD 7.2, mitigasi risiko typo).

Di fase mock, `foto_tools_url` dan `foto_penempatan_url` berisi data URL hasil kompresi. Di fase Supabase, keduanya berisi URL publik Storage. Tipe tidak berubah.

## 6. Halaman & Pemetaan Kebutuhan

| Rute | Isi | FR |
|---|---|---|
| `/` | Kolom cari besar, chip kategori, grid kartu (foto, nama, jumlah, lokasi ringkas), FAB Scan | FR-B1, B2, B3 |
| `/tools/:id` | Foto tools besar, kategori, jumlah, keterangan, lokasi lengkap, tombol "Lihat penempatan" | FR-B4 |
| `/scan` | Kamera + input kode manual | FR-C1, C3 |
| `/return/:id` | Foto penempatan full-width, label lokasi besar "Kembalikan ke sini" | FR-C2 |
| `/admin` | Form login | FR-D1 |
| `/admin/tools` | Daftar + form tambah/ubah/hapus, preview QR | FR-A1, A2, A5, A7, A8 |
| `/admin/categories` | CRUD kategori | FR-A3 |
| `/admin/locations` | CRUD lokasi berjenjang | FR-A4 |
| `/admin/labels` | Lembar label QR siap cetak | FR-A6 |

FR-D2 (hak akses tulis) di fase ini ditegakkan di sisi klien lewat `RequireAuth`. Penegakan sebenarnya adalah RLS Supabase di fase berikutnya — ini disengaja dan dicatat sebagai batasan, bukan celah yang terlewat.

FR-D3 (integrasi Hub) di luar lingkup fase front end.

## 7. Alur Data

Tools, kategori, dan lokasi dimuat sekali saat aplikasi dibuka ke dalam context. Pencarian dan filter kategori berjalan sepenuhnya di sisi klien terhadap koleksi itu — instan untuk ratusan tools (PRD bagian 6, Performa).

Pencarian menggabungkan dua hal: pencocokan substring biasa, lalu pencocokan fuzzy untuk toleransi typo (FR-B5). Fuzzy ditulis sendiri sebagai fungsi kecil di `lib/fuzzy.ts`, tanpa dependensi tambahan. Hasil diurutkan: cocok persis di atas, fuzzy di bawah.

Field `qr_value` berisi ID tools, sesuai PRD 7.2. Namun QR yang **dicetak** meng-encode URL lengkap `<origin>/return/<id>`, bukan ID telanjang — sebab kamera bawaan HP hanya bisa membuka URL, dan ID telanjang akan tampil sebagai teks tak berguna. Dengan begitu label yang sama melayani dua jalan masuk: lewat tombol Scan di aplikasi, dan lewat kamera bawaan HP sebagai deep-link.

Agar keduanya bekerja, scanner tidak menebak: fungsi `parseScannedValue(text)` menerima URL `<origin>/return/<id>` maupun ID telanjang, mengembalikan ID, dan mengembalikan `null` untuk QR asing (misal QR promosi di kemasan). Scan yang berhasil mengarah ke `/return/:id`.

Foto dipilih dari HP, dikompres di kanvas ke sisi terpanjang ~800px kualitas ~0.7 sebelum disimpan (FR-A8). Gambar di grid di-lazy-load (mitigasi risiko PRD bagian 12).

## 8. Penanganan Kesalahan

| Kondisi | Perilaku |
|---|---|
| Izin kamera ditolak / kamera gagal | Layar scan langsung menawarkan input kode manual — tidak pernah jadi jalan buntu |
| QR menunjuk tools yang sudah dihapus | Pesan jelas "Tools tidak ditemukan" + tombol kembali ke pencarian, bukan halaman kosong |
| Foto gagal dibaca/dikompres | Form tetap bisa disimpan tanpa foto, dengan peringatan |
| Kuota localStorage penuh | Pesan eksplisit bahwa penyimpanan browser penuh; data lama tidak diam-diam hilang |
| Field wajib kosong | Validasi form sebelum simpan |
| Kategori/lokasi yang masih dipakai tools dihapus | Ditolak dengan pesan yang menyebut berapa tools memakainya. Tanpa ini, tools akan menunjuk kategori hantu |

## 9. Rencana Pengujian

Vitest + React Testing Library, difokuskan pada logika yang bisa salah tanpa terlihat:

- `lib/fuzzy.ts` — menemukan hasil dengan ejaan sedikit salah; tidak mengembalikan hasil yang jelas tidak relevan
- Filter kategori dan gabungan cari + filter
- `MockRepository` — simpan/ubah/hapus bertahan, `getTool` mengembalikan `null` untuk id tak dikenal
- `parseScannedValue` — menerima URL penuh dan ID telanjang, menolak QR asing
- `lib/image.ts` — perhitungan penyesuaian dimensi (fungsi murni `fitDimensions`)

Diverifikasi langsung di browser, bukan lewat mock: scan kamera, kompresi kanvas yang sebenarnya, dan hasil cetak lembar label. Kanvas tidak diuji di Vitest karena jsdom tidak mengimplementasikan `toDataURL` — menguji kanvas palsu hanya akan membuktikan mock-nya jalan, bukan kompresinya. Karena itu hanya perhitungan dimensinya yang diuji unit, dan hasil kompresi sebenarnya diperiksa di browser.

## 10. UI/UX

Mengikuti PRD bagian 10.

- Mobile-first, dominan portrait, layout kartu, target sentuh besar
- Aksen Toyota Red `#EB0A1E` di atas netral abu/putih, kontras tinggi untuk lingkungan pabrik
- FAB Scan selalu terlihat di halaman MP
- Halaman `/return/:id` mengutamakan foto penempatan berukuran besar dan label lokasi yang terbaca dari jarak pandang kerja
- Ikon lucide, tipografi jelas, animasi ringan

## 11. Di Luar Lingkup Fase Ini

Ditunda ke fase Supabase: database, Auth, RLS, Storage, hosting Netlify, integrasi Casting Tools Hub (FR-D3).

Ditunda sesuai PRD bagian 3.2: check-out/check-in, notifikasi tools belum kembali, login individual MP, dashboard analitik, mode offline (PWA).

## 12. Kriteria Selesai

- Seluruh rute pada bagian 6 berfungsi di HP Android kelas menengah
- Scan QR dari label tercetak membuka halaman "Kembalikan ke sini" yang benar
- Data yang diinput admin bertahan setelah refresh
- Pengujian pada bagian 9 lulus
- Tidak ada komponen UI yang mengimpor sumber data selain lewat `ToolRepository`
