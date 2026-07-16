# Tool Locator — Rencana Implementasi Front End

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun seluruh antarmuka Tool Locator Fase 1 (cari tools, detail, scan QR untuk pengembalian, panel admin, cetak label) berjalan penuh di atas data mock di browser, tanpa Supabase.

**Architecture:** Semua akses data melewati satu antarmuka `ToolRepository` yang di fase ini diisi `MockRepository` berbasis `localStorage`; komponen UI tidak pernah menyentuh sumber data secara langsung, sehingga penukaran ke Supabase nanti terisolasi di satu berkas. Autentikasi admin memakai `AuthProvider` berstub yang meniru bentuk Supabase Auth. Pencarian dan filter berjalan sepenuhnya di sisi klien.

**Tech Stack:** React + Vite + TypeScript, Tailwind CSS v4, lucide-react, React Router, qrcode.react, html5-qrcode, react-to-print, Vitest + React Testing Library.

**Acuan spec:** `docs/superpowers/specs/2026-07-16-tool-locator-frontend-design.md`
**Acuan PRD:** `PRD-TMMIN-TLOC-001.docx`

## Global Constraints

- **Tailwind v4**, dipasang lewat plugin `@tailwindcss/vite` dan `@import "tailwindcss";` di CSS utama. **Jangan** membuat `tailwind.config.js` atau konfigurasi PostCSS — itu cara v3 dan tidak berlaku lagi. (Diverifikasi via Context7, 16 Jul 2026.)
- **`react-to-print` v3**: `useReactToPrint({ contentRef })`. **Jangan** memakai `content: () => ref.current` (API v2 yang sudah usang). (Diverifikasi via Context7.)
- **`html5-qrcode`**: callback error pada `start()` menyala di **setiap frame** yang tidak berisi QR. Ini normal. **Jangan** menampilkannya sebagai pesan error ke pengguna — abaikan diam-diam. Hanya kegagalan pada `Promise` dari `start()` (izin ditolak, kamera tidak ada) yang merupakan error sebenarnya.
- Semua metode `ToolRepository` `async`, termasuk di implementasi mock.
- **Penulisan di repository mengganti slot, tidak pernah memutasi objek di tempat.** Tulis `db.tools[i] = { ...db.tools[i], ...input }`, jangan `Object.assign(tool, input)` atau `tool.jumlah += 1`. Alasannya: `load()` menyalin array seed secara dangkal (`[...seedTools]`), jadi pada reseed pertama objek di dalamnya masih objek seed yang sama. Mengganti slot membiarkannya utuh; memutasi di tempat akan merusak data seed secara permanen — dan test reseed tidak akan menangkapnya, karena panjang array tetap 8.
- Tidak ada komponen UI yang mengimpor `MockRepository`, `seed.ts`, atau `localStorage` secara langsung — selalu lewat `ToolRepository` dari context.
- Warna aksen Toyota Red: `#EB0A1E`. Netral abu/putih. Kontras tinggi.
- Mobile-first, dominan portrait, target sentuh besar (minimal 44px).
- Seluruh teks antarmuka dalam Bahasa Indonesia.
- Lokasi selalu lewat dropdown berjenjang Area → Rak → Level/Bin, tidak pernah teks bebas.
- Foto dikompres ke sisi terpanjang 800px, kualitas 0.7, sebelum disimpan.

---

### Task 1: Scaffold proyek

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test/setup.ts`, `.gitignore`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: tidak ada (tugas pertama)
- Produces: proyek Vite yang bisa dijalankan (`npm run dev`) dan diuji (`npm test`); alias impor `@/` menunjuk `src/`

Direktori proyek sudah berisi `PRD-TMMIN-TLOC-001.docx`, `docs/`, dan `.claude/`, jadi Vite tidak bisa scaffold langsung ke sini secara non-interaktif. Scaffold ke folder sementara di luar proyek, lalu salin isinya masuk.

- [ ] **Step 1: Scaffold Vite ke folder sementara lalu salin masuk**

```bash
cd /c/Users/El/Documents
npm create vite@latest _tloc_scaffold -- --template react-ts
cp -r _tloc_scaffold/. /c/Users/El/Documents/tools-locator/
rm -rf _tloc_scaffold
cd /c/Users/El/Documents/tools-locator
npm install
```

- [ ] **Step 2: Pasang dependensi**

```bash
npm install react-router-dom qrcode.react html5-qrcode react-to-print lucide-react
npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/node
```

- [ ] **Step 3: Inisialisasi git**

Proyek ini belum berupa repo git, sedangkan setiap task diakhiri commit.

```bash
git init
git add -A
git commit -m "chore: scaffold vite react ts project"
```

- [ ] **Step 4: Konfigurasi Vite (Tailwind v4 + alias + Vitest)**

Tulis `vite.config.ts`:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 5: Daftarkan alias `@/` di TypeScript**

Tambahkan ke `compilerOptions` dalam `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] },
    "types": ["vitest/globals"]
  }
}
```

**Jangan** menambahkan `"baseUrl"`. TypeScript 6 memperlakukannya sebagai error (`TS5101`) dan `npm run build` akan gagal; `moduleResolution: "bundler"` hanya butuh `paths`. `types: ["vitest/globals"]` diperlukan karena `globals: true` dipakai di konfigurasi Vitest.

- [ ] **Step 6: Ganti isi `src/index.css` dengan Tailwind v4 + token warna**

```css
@import "tailwindcss";

@theme {
  --color-toyota: #EB0A1E;
  --color-toyota-dark: #C00818;
}

html, body, #root {
  height: 100%;
}

body {
  @apply bg-neutral-50 text-neutral-900 antialiased;
}
```

- [ ] **Step 7: Buat setup pengujian**

Tulis `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Tambahkan skrip ke `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: Tulis test smoke yang gagal**

Tulis `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('menampilkan nama aplikasi', () => {
  render(<App />)
  expect(screen.getByText('Tool Locator')).toBeInTheDocument()
})
```

- [ ] **Step 9: Jalankan test, pastikan GAGAL**

Run: `npm test`
Expected: FAIL — `App` masih berisi template bawaan Vite, teks "Tool Locator" tidak ditemukan.

- [ ] **Step 10: Ganti isi `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-toyota">Tool Locator</h1>
    </div>
  )
}
```

Hapus `src/App.css` bila ada, dan hapus impornya dari `App.tsx`.

- [ ] **Step 11: Jalankan test, pastikan LULUS**

Run: `npm test`
Expected: PASS (1 test)

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: configure tailwind v4, vitest, and path alias"
```

---

### Task 2: Tipe data & antarmuka repository

**Files:**
- Create: `src/data/types.ts`, `src/data/repository.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces: tipe `Category`, `Location`, `Tool`, `ToolInput`, `CategoryInput`, `LocationInput`, `AdminSession`; antarmuka `ToolRepository`. Seluruh task berikutnya memakai nama-nama ini persis.

Task ini hanya tipe — tidak ada test, karena tidak ada perilaku runtime untuk diuji. Kebenarannya ditegakkan compiler saat task berikutnya mengimplementasikan antarmuka ini.

- [ ] **Step 1: Tulis `src/data/types.ts`**

```typescript
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
```

- [ ] **Step 2: Tulis `src/data/repository.ts`**

```typescript
import type {
  Category,
  CategoryInput,
  Location,
  LocationInput,
  Tool,
  ToolInput,
} from './types'

export interface ToolRepository {
  getTools(): Promise<Tool[]>
  getTool(id: string): Promise<Tool | null>
  saveTool(input: ToolInput): Promise<Tool>
  deleteTool(id: string): Promise<void>

  getCategories(): Promise<Category[]>
  saveCategory(input: CategoryInput): Promise<Category>
  deleteCategory(id: string): Promise<void>

  getLocations(): Promise<Location[]>
  saveLocation(input: LocationInput): Promise<Location>
  deleteLocation(id: string): Promise<void>
}
```

- [ ] **Step 3: Pastikan TypeScript bersih**

Run: `npx tsc -b`
Expected: tidak ada error.

- [ ] **Step 4: Commit**

```bash
git add src/data
git commit -m "feat: add data types and repository interface"
```

---

### Task 3: Data contoh (seed)

**Files:**
- Create: `src/data/seed.ts`

**Interfaces:**
- Consumes: tipe dari Task 2
- Produces: `seedCategories: Category[]`, `seedLocations: Location[]`, `seedTools: Tool[]`, `ADMIN_CREDENTIAL: { email: string; password: string }`

- [ ] **Step 1: Tulis `src/data/seed.ts`**

```typescript
import type { Category, Location, Tool } from './types'

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

export const seedLocations: Location[] = [
  { id: 'loc-melting-a1', area: 'Melting', rak: 'Rak A', level_bin: 'Level 1' },
  { id: 'loc-melting-a2', area: 'Melting', rak: 'Rak A', level_bin: 'Level 2' },
  { id: 'loc-pouring-b1', area: 'Pouring', rak: 'Rak B', level_bin: 'Level 1' },
  { id: 'loc-pouring-b3', area: 'Pouring', rak: 'Rak B', level_bin: 'Bin 3' },
  { id: 'loc-analysis-c1', area: 'Analysis', rak: 'Rak C', level_bin: 'Level 1' },
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
```

- [ ] **Step 2: Pastikan TypeScript bersih**

Run: `npx tsc -b`
Expected: tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add src/data/seed.ts
git commit -m "feat: add seed data for casting division tools"
```

---

### Task 4: MockRepository

**Files:**
- Create: `src/data/mockRepository.ts`
- Test: `src/data/mockRepository.test.ts`

**Interfaces:**
- Consumes: `ToolRepository`, tipe dari Task 2, seed dari Task 3
- Produces: `class MockRepository implements ToolRepository`, konstanta `STORAGE_KEY = 'tool-locator:data:v1'`

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/data/mockRepository.test.ts`:

```typescript
import { beforeEach, describe, expect, test } from 'vitest'
import { MockRepository, STORAGE_KEY } from './mockRepository'

function repo() {
  return new MockRepository()
}

beforeEach(() => {
  localStorage.clear()
})

describe('MockRepository', () => {
  test('memuat data seed saat penyimpanan masih kosong', async () => {
    const tools = await repo().getTools()
    expect(tools.length).toBeGreaterThan(0)
    expect(tools.some((t) => t.nama === 'Kunci Pas 12')).toBe(true)
  })

  test('getTool mengembalikan null untuk id tak dikenal', async () => {
    expect(await repo().getTool('tidak-ada')).toBeNull()
  })

  test('tools baru tersimpan dan bertahan di instance lain', async () => {
    const created = await repo().saveTool({
      nama: 'Kuas Coating',
      category_id: 'cat-pouring',
      location_id: 'loc-pouring-b1',
      jumlah: 7,
    })

    expect(created.id).toBeTruthy()
    expect(created.qr_value).toBe(created.id)

    const found = await repo().getTool(created.id)
    expect(found?.nama).toBe('Kuas Coating')
  })

  test('menyimpan dengan id yang ada akan mengubah, bukan menambah', async () => {
    const before = await repo().getTools()
    const target = before[0]

    await repo().saveTool({
      id: target.id,
      nama: 'Kunci Pas 14',
      category_id: target.category_id,
      location_id: target.location_id,
      jumlah: 9,
    })

    const after = await repo().getTools()
    expect(after.length).toBe(before.length)
    const updated = after.find((t) => t.id === target.id)
    expect(updated?.nama).toBe('Kunci Pas 14')
    expect(updated?.jumlah).toBe(9)
    expect(updated?.qr_value).toBe(target.qr_value)
  })

  test('hapus tools menghilangkannya dari daftar', async () => {
    const before = await repo().getTools()
    await repo().deleteTool(before[0].id)
    const after = await repo().getTools()
    expect(after.length).toBe(before.length - 1)
    expect(await repo().getTool(before[0].id)).toBeNull()
  })

  test('menolak hapus kategori yang masih dipakai tools', async () => {
    // Sebut jumlahnya, bukan sekadar "masih dipakai": tanpa ini, kode yang
    // salah hitung atau memeriksa field keliru tetap lolos test.
    await expect(repo().deleteCategory('cat-kunci')).rejects.toThrow(
      /masih dipakai 3 tools/i,
    )
  })

  test('reseed setelah storage dikosongkan tidak membawa data lama', async () => {
    await repo().saveTool({
      nama: 'Tools Sementara',
      category_id: 'cat-kunci',
      location_id: 'loc-melting-a1',
      jumlah: 1,
    })
    localStorage.clear()

    const tools = await repo().getTools()
    expect(tools).toHaveLength(8)
    expect(tools.some((t) => t.nama === 'Tools Sementara')).toBe(false)
  })

  test('mengizinkan hapus kategori yang tidak dipakai', async () => {
    const created = await repo().saveCategory({ nama: 'Kategori Kosong' })
    await repo().deleteCategory(created.id)
    const categories = await repo().getCategories()
    expect(categories.some((c) => c.id === created.id)).toBe(false)
  })

  test('menolak hapus lokasi yang masih dipakai tools', async () => {
    await expect(repo().deleteLocation('loc-melting-a1')).rejects.toThrow(
      /masih dipakai/i,
    )
  })

  test('memakai kunci penyimpanan berversi', () => {
    expect(STORAGE_KEY).toBe('tool-locator:data:v1')
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- mockRepository`
Expected: FAIL — modul `./mockRepository` belum ada.

- [ ] **Step 3: Tulis `src/data/mockRepository.ts`**

```typescript
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
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test -- mockRepository`
Expected: PASS (10 test)

- [ ] **Step 5: Commit**

```bash
git add src/data/mockRepository.ts src/data/mockRepository.test.ts
git commit -m "feat: add localStorage-backed mock repository"
```

---

### Task 5: Pencarian toleran typo

**Files:**
- Create: `src/lib/fuzzy.ts`
- Test: `src/lib/fuzzy.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces: `levenshtein(a: string, b: string): number`, `maxDistanceFor(query: string): number`, `matchScore(query: string, text: string): number | null`, `searchByName<T>(items: T[], query: string, getText: (item: T) => string): T[]`

`matchScore` mengembalikan `0` untuk cocok persis (substring), angka positif untuk kecocokan fuzzy (makin kecil makin mirip), dan `null` bila tidak cocok. `searchByName` mengurutkan cocok persis di atas.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/lib/fuzzy.test.ts`:

```typescript
import { describe, expect, test } from 'vitest'
import { levenshtein, matchScore, searchByName } from './fuzzy'

describe('levenshtein', () => {
  test('menghitung jarak antar kata', () => {
    expect(levenshtein('kunci', 'kunci')).toBe(0)
    expect(levenshtein('kunci', 'kunsi')).toBe(1)
    expect(levenshtein('', 'palu')).toBe(4)
  })
})

describe('matchScore', () => {
  test('memberi skor 0 untuk kecocokan substring', () => {
    expect(matchScore('kunci', 'Kunci Pas 12')).toBe(0)
    expect(matchScore('pas', 'Kunci Pas 12')).toBe(0)
  })

  test('tidak peduli huruf besar/kecil', () => {
    expect(matchScore('KUNCI', 'Kunci Pas 12')).toBe(0)
  })

  test('tetap menemukan hasil walau ejaan sedikit salah', () => {
    expect(matchScore('kunsi', 'Kunci Pas 12')).toBe(1)
    expect(matchScore('tang kombinasi', 'Tang Kombinasi')).toBe(0)
    expect(matchScore('kombinasl', 'Tang Kombinasi')).toBe(1)
  })

  test('menemukan kata panjang lewat awalannya yang salah ketik', () => {
    // Menguji cabang prefix secara khusus: query lebih pendek dari katanya,
    // sehingga jarak ke kata utuh jauh (>2) dan hanya perbandingan awalan
    // yang bisa menemukannya. Tanpa cabang itu, ini null.
    expect(matchScore('termoc', 'Thermocouple Probe')).toBe(2)
  })

  test('menolak kata yang jelas tidak relevan', () => {
    expect(matchScore('palu', 'Kunci Pas 12')).toBeNull()
    expect(matchScore('thermocouple', 'Sekop Pasir')).toBeNull()
  })

  test('query kosong mencocokkan apa saja', () => {
    expect(matchScore('', 'Kunci Pas 12')).toBe(0)
  })

  test('query pendek tidak ditoleransi typo-nya', () => {
    // 3 huruf.
    expect(matchScore('pal', 'Pas')).toBeNull()
    // 4 huruf: tanpa aturan ini, "pasu" memunculkan tiga tools berbeda dan
    // "paku" memunculkan Palu Karet.
    expect(matchScore('pasu', 'Kunci Pas 12')).toBeNull()
    expect(matchScore('pasu', 'Sekop Pasir')).toBeNull()
    expect(matchScore('paku', 'Palu Karet')).toBeNull()
  })
})

describe('searchByName', () => {
  // Urutan sengaja dibalik: yang cocok fuzzy ditaruh SEBELUM yang cocok
  // persis. Kalau fixture-nya sudah urut, menghapus sort() tetap membuat
  // test lulus — dan urutan hasil tidak benar-benar teruji.
  const tools = [
    { nama: 'Kunsi Inggris' },
    { nama: 'Tang Kombinasi' },
    { nama: 'Kunci Pas 12' },
  ]
  const getText = (t: { nama: string }) => t.nama

  test('mengembalikan semua item untuk query kosong', () => {
    expect(searchByName(tools, '', getText)).toHaveLength(3)
  })

  test('mendahulukan cocok persis di atas cocok fuzzy', () => {
    const result = searchByName(tools, 'kunci', getText)
    expect(result[0].nama).toBe('Kunci Pas 12')
    expect(result.map((t) => t.nama)).toContain('Kunsi Inggris')
  })

  test('membuang item yang tidak cocok', () => {
    const result = searchByName(tools, 'kunci', getText)
    expect(result.map((t) => t.nama)).not.toContain('Tang Kombinasi')
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- fuzzy`
Expected: FAIL — modul `./fuzzy` belum ada.

- [ ] **Step 3: Tulis `src/lib/fuzzy.ts`**

```typescript
function normalize(value: string): string {
  return value.toLowerCase().trim()
}

export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)

  for (let i = 1; i <= a.length; i++) {
    const current = new Array<number>(b.length + 1)
    current[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      )
    }
    previous = current
  }

  return previous[b.length]
}

// Query pendek tidak ditoleransi typo-nya. Pada 4 huruf, jarak 1 sudah
// mencocokkan terlalu banyak: "pasu" akan memunculkan Kunci Pas 12, Sekop
// Pasir, dan Palu Karet sekaligus, dan "paku" (kata yang sah dan berbeda)
// memunculkan Palu Karet. Konsekuensinya disengaja: salah ketik pada nama
// pendek seperti "Palo" tidak ketemu, dan MP mengetik ulang — itu lebih baik
// daripada disodori tools yang salah.
export function maxDistanceFor(query: string): number {
  if (query.length <= 4) return 0
  if (query.length <= 5) return 1
  return 2
}

export function matchScore(query: string, text: string): number | null {
  const q = normalize(query)
  const t = normalize(text)

  if (q === '') return 0
  if (t.includes(q)) return 0

  const max = maxDistanceFor(q)
  if (max === 0) return null

  let best = Infinity
  for (const word of t.split(/\s+/)) {
    const whole = levenshtein(q, word)
    // Bandingkan juga dengan potongan awal kata sepanjang query, supaya
    // "kombinasl" tetap cocok dengan kata panjang seperti "kombinasi".
    const prefix =
      word.length > q.length ? levenshtein(q, word.slice(0, q.length)) : whole
    best = Math.min(best, whole, prefix)
  }

  return best <= max ? best : null
}

export function searchByName<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
): T[] {
  if (normalize(query) === '') return items

  const scored: Array<{ item: T; score: number }> = []
  for (const item of items) {
    const score = matchScore(query, getText(item))
    if (score !== null) scored.push({ item, score })
  }

  scored.sort((a, b) => a.score - b.score)
  return scored.map((s) => s.item)
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test -- fuzzy`
Expected: PASS (11 test)

- [ ] **Step 5: Commit**

```bash
git add src/lib/fuzzy.ts src/lib/fuzzy.test.ts
git commit -m "feat: add typo-tolerant search matching"
```

---

### Task 6: Nilai QR & format lokasi

**Files:**
- Create: `src/lib/qr.ts`, `src/lib/format.ts`
- Test: `src/lib/qr.test.ts`, `src/lib/format.test.ts`

**Interfaces:**
- Consumes: tipe `Location` dari Task 2
- Produces: `buildQrUrl(origin: string, toolId: string): string`, `parseScannedValue(text: string): string | null`, `formatLocation(location: Location | undefined): string`

QR yang dicetak meng-encode URL lengkap agar bisa dibuka kamera bawaan HP; `parseScannedValue` menerima URL maupun ID telanjang.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/lib/qr.test.ts`:

```typescript
import { describe, expect, test } from 'vitest'
import { buildQrUrl, parseScannedValue } from './qr'

describe('buildQrUrl', () => {
  test('membentuk URL pengembalian', () => {
    expect(buildQrUrl('https://tloc.app', 'tool-001')).toBe(
      'https://tloc.app/return/tool-001',
    )
  })

  test('tidak menghasilkan garis miring ganda', () => {
    expect(buildQrUrl('https://tloc.app/', 'tool-001')).toBe(
      'https://tloc.app/return/tool-001',
    )
  })
})

describe('parseScannedValue', () => {
  test('mengambil id dari URL penuh', () => {
    expect(parseScannedValue('https://tloc.app/return/tool-001')).toBe('tool-001')
  })

  test('mengambil id dari URL dengan garis miring di akhir', () => {
    expect(parseScannedValue('https://tloc.app/return/tool-001/')).toBe('tool-001')
  })

  test('menerima id telanjang', () => {
    expect(parseScannedValue('tool-001')).toBe('tool-001')
  })

  test('mengabaikan spasi di tepi', () => {
    expect(parseScannedValue('  tool-001  ')).toBe('tool-001')
  })

  test('menolak QR asing', () => {
    expect(parseScannedValue('https://promo.example.com/diskon')).toBeNull()
    expect(parseScannedValue('halo dunia')).toBeNull()
    expect(parseScannedValue('')).toBeNull()
  })

  test('menerima URL dari host lain — disengaja, bukan kelalaian', () => {
    // Host tidak diperiksa dengan sengaja: id hanya dipakai untuk navigasi
    // internal, dan memeriksa host akan membuat label yang dicetak sebelum
    // pindah domain berhenti bisa di-scan. Test ini mengunci keputusan itu
    // supaya tidak "diperbaiki" tanpa membaca alasannya.
    expect(parseScannedValue('https://host-lain.example/return/tool-001')).toBe(
      'tool-001',
    )
  })

  test('menolak id berisi karakter di luar [A-Za-z0-9_-]', () => {
    // Seluruh alasan keamanan di atas bertumpu pada batasan karakter ini:
    // tanpa titik dan titik dua, id tidak bisa menjadi protokol, host, atau
    // path. Tanpa test ini, melebarkan regex akan membuat komentar itu bohong
    // tanpa ada yang gagal.
    expect(parseScannedValue('https://x.example/return/a.b:c')).toBeNull()
    expect(parseScannedValue('../../etc/passwd')).toBeNull()
  })

  test('menerima id UUID dari tools yang dibuat saat runtime', () => {
    // Tools baru memakai crypto.randomUUID(). Kalau regex menolak bentuk ini,
    // label tools yang baru dibuat tidak akan bisa di-scan sama sekali.
    const uuid = '3f2504e0-4f89-11d3-9a0c-0305e82c3301'
    expect(parseScannedValue(uuid)).toBe(uuid)
    expect(parseScannedValue(`https://tloc.app/return/${uuid}`)).toBe(uuid)
  })
})
```

Tulis `src/lib/format.test.ts`:

```typescript
import { describe, expect, test } from 'vitest'
import { formatLocation } from './format'

describe('formatLocation', () => {
  test('menggabungkan area, rak, dan level/bin', () => {
    expect(
      formatLocation({
        id: 'loc-1',
        area: 'Melting',
        rak: 'Rak A',
        level_bin: 'Level 2',
      }),
    ).toBe('Melting · Rak A · Level 2')
  })

  test('menangani lokasi yang tidak ditemukan', () => {
    expect(formatLocation(undefined)).toBe('Lokasi belum diatur')
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- qr format`
Expected: FAIL — modul `./qr` dan `./format` belum ada.

- [ ] **Step 3: Tulis `src/lib/qr.ts`**

```typescript
export function buildQrUrl(origin: string, toolId: string): string {
  return `${origin.replace(/\/$/, '')}/return/${toolId}`
}

// Menerima dua bentuk: URL penuh dari label cetak (dibuka kamera bawaan HP)
// dan ID telanjang. Mengembalikan null untuk QR asing — misalnya QR promosi
// yang kebetulan tertempel di kemasan.
//
// Host pada URL sengaja TIDAK diperiksa. Alasannya dua:
//   1. Id hasil ekstraksi hanya dipakai untuk navigasi internal
//      (`navigate('/return/<id>')`), tidak pernah untuk membuka host asing
//      atau mengambil data dari sana. Regex juga membatasi id ke
//      [A-Za-z0-9_-]+, jadi tidak ada protokol atau path yang bisa diselipkan.
//   2. Label dicetak memakai origin saat itu. Kalau host diperiksa, seluruh
//      label yang dicetak sebelum aplikasi pindah domain (misal dari
//      localhost ke Netlify) akan berhenti bisa di-scan.
// Ancaman yang tersisa — QR palsu agar tools dikembalikan ke tempat salah —
// sudah bisa dilakukan siapa pun yang menempel label palsu berisi ID asli,
// jadi memeriksa host tidak menambah perlindungan nyata.
export function parseScannedValue(text: string): string | null {
  const raw = text.trim()
  if (raw === '') return null

  const fromUrl = raw.match(/\/return\/([A-Za-z0-9_-]+)\/?$/)
  if (fromUrl) return fromUrl[1]

  if (/^[A-Za-z0-9_-]+$/.test(raw)) return raw

  return null
}
```

- [ ] **Step 4: Tulis `src/lib/format.ts`**

```typescript
import type { Location } from '@/data/types'

export function formatLocation(location: Location | undefined): string {
  if (!location) return 'Lokasi belum diatur'
  return `${location.area} · ${location.rak} · ${location.level_bin}`
}
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `npm test -- qr format`
Expected: PASS (12 test)

- [ ] **Step 6: Commit**

```bash
git add src/lib/qr.ts src/lib/qr.test.ts src/lib/format.ts src/lib/format.test.ts
git commit -m "feat: add qr value parsing and location formatting"
```

---

### Task 7: Kompresi foto

**Files:**
- Create: `src/lib/image.ts`
- Test: `src/lib/image.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces: `MAX_SIDE`, `QUALITY`, `fitDimensions(width: number, height: number, max: number): { width: number; height: number }`, `compressImage(file: File, max?: number, quality?: number): Promise<string>` (mengembalikan data URL JPEG)

Hanya `fitDimensions` yang diuji unit. Kanvas tidak diuji di Vitest karena jsdom tidak mengimplementasikan `toDataURL` — menguji kanvas palsu hanya membuktikan mock-nya jalan, bukan kompresinya. Hasil kompresi sebenarnya diperiksa di browser pada Task 18.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/lib/image.test.ts`:

```typescript
import { describe, expect, test } from 'vitest'
import { fitDimensions } from './image'

describe('fitDimensions', () => {
  test('mengecilkan gambar landscape ke sisi terpanjang', () => {
    expect(fitDimensions(1600, 1200, 800)).toEqual({ width: 800, height: 600 })
  })

  test('mengecilkan gambar portrait ke sisi terpanjang', () => {
    expect(fitDimensions(1200, 1600, 800)).toEqual({ width: 600, height: 800 })
  })

  test('membiarkan gambar yang sudah kecil apa adanya', () => {
    expect(fitDimensions(400, 300, 800)).toEqual({ width: 400, height: 300 })
  })

  test('menangani gambar persegi', () => {
    expect(fitDimensions(1000, 1000, 800)).toEqual({ width: 800, height: 800 })
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- image`
Expected: FAIL — modul `./image` belum ada.

- [ ] **Step 3: Tulis `src/lib/image.ts`**

```typescript
export const MAX_SIDE = 800
export const QUALITY = 0.7

export function fitDimensions(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  if (width <= max && height <= max) return { width, height }
  const scale = width >= height ? max / width : max / height
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export async function compressImage(
  file: File,
  max: number = MAX_SIDE,
  quality: number = QUALITY,
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const { width, height } = fitDimensions(bitmap.width, bitmap.height, max)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Kanvas tidak tersedia di browser ini')

    context.drawImage(bitmap, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    bitmap.close()
  }
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test -- image`
Expected: PASS (4 test)

- [ ] **Step 5: Commit**

```bash
git add src/lib/image.ts src/lib/image.test.ts
git commit -m "feat: add canvas-based image compression"
```

---

### Task 8: Context data & kerangka routing

**Files:**
- Create: `src/data/DataProvider.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`, `src/App.test.tsx`
- Test: `src/data/DataProvider.test.tsx`

**Interfaces:**
- Consumes: `MockRepository` (Task 4), `ToolRepository` dan tipe (Task 2)
- Produces: komponen `<DataProvider>`, hook `useData(): DataState` di mana

```typescript
type DataState = {
  tools: Tool[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  repo: ToolRepository
}
```

Ini satu-satunya tempat `MockRepository` di-instansiasi. Saat Supabase masuk, hanya baris itu yang berubah.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/data/DataProvider.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { DataProvider, useData } from './DataProvider'

beforeEach(() => {
  localStorage.clear()
})

function Probe() {
  const { tools, categories, loading } = useData()
  if (loading) return <p>memuat</p>
  return <p>{`${tools.length} tools, ${categories.length} kategori`}</p>
}

test('memuat tools dan kategori lalu menyediakannya lewat useData', async () => {
  render(
    <DataProvider>
      <Probe />
    </DataProvider>,
  )

  await waitFor(() => {
    expect(screen.getByText(/8 tools, 4 kategori/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- DataProvider`
Expected: FAIL — modul `./DataProvider` belum ada.

- [ ] **Step 3: Tulis `src/data/DataProvider.tsx`**

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Category, Location, Tool } from './types'
import type { ToolRepository } from './repository'
import { MockRepository } from './mockRepository'

export type DataState = {
  tools: Tool[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  repo: ToolRepository
}

const DataContext = createContext<DataState | null>(null)

// Satu-satunya tempat implementasi repository dipilih. Saat Supabase masuk,
// hanya baris ini yang berubah.
const repository: ToolRepository = new MockRepository()

export function DataProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, c, l] = await Promise.all([
        repository.getTools(),
        repository.getCategories(),
        repository.getLocations(),
      ])
      setTools(t)
      setCategories(c)
      setLocations(l)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<DataState>(
    () => ({
      tools,
      categories,
      locations,
      loading,
      error,
      refresh,
      repo: repository,
    }),
    [tools, categories, locations, loading, error, refresh],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataState {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData harus dipakai di dalam <DataProvider>')
  return context
}
```

- [ ] **Step 4: Jalankan test, pastikan LULUS**

Run: `npm test -- DataProvider`
Expected: PASS (1 test)

- [ ] **Step 5: Pasang router di `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 6: Ganti `src/App.tsx` dengan kerangka rute**

Halaman-halaman diisi pada task berikutnya; sementara ini placeholder agar rute bisa diuji lebih dulu.

```tsx
import { Route, Routes } from 'react-router-dom'
import { DataProvider } from '@/data/DataProvider'

function Placeholder({ nama }: { nama: string }) {
  return <p className="p-6">{nama}</p>
}

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Placeholder nama="Tool Locator" />} />
        <Route path="/tools/:id" element={<Placeholder nama="Detail" />} />
        <Route path="/scan" element={<Placeholder nama="Scan" />} />
        <Route path="/return/:id" element={<Placeholder nama="Kembalikan" />} />
      </Routes>
    </DataProvider>
  )
}
```

- [ ] **Step 7: Perbaiki test smoke dari Task 1**

`App` sekarang butuh router. Ganti isi `src/App.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('menampilkan nama aplikasi di beranda', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  await waitFor(() => {
    expect(screen.getByText('Tool Locator')).toBeInTheDocument()
  })
})
```

- [ ] **Step 8: Jalankan seluruh test, pastikan LULUS**

Run: `npm test`
Expected: PASS — semua test dari Task 1–8.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add data context and app routing skeleton"
```

---

### Task 9: Beranda — cari, filter kategori, grid tools

**Files:**
- Create: `src/pages/Home.tsx`, `src/components/ToolCard.tsx`, `src/components/ScanFab.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/Home.test.tsx`

**Interfaces:**
- Consumes: `useData()` (Task 8), `searchByName` (Task 5), `formatLocation` (Task 6)
- Produces: halaman `Home` pada rute `/`; `ToolCard` menerima props `{ tool: Tool; categoryName: string; locationLabel: string }`; `ScanFab` tanpa props

Memenuhi FR-B1 (cari real-time), FR-B2 (filter kategori), FR-B3 (hasil: foto, nama, jumlah, lokasi ringkas), FR-B5 (toleransi typo).

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/Home.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
})

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan semua tools saat pencarian kosong', async () => {
  renderHome()
  await waitFor(() => {
    expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  })
  expect(screen.getByText('Sekop Pasir')).toBeInTheDocument()
})

test('menyaring tools sesuai kata pencarian', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.type(screen.getByPlaceholderText(/cari tools/i), 'kunci')

  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  expect(screen.queryByText('Sekop Pasir')).not.toBeInTheDocument()
})

test('tetap menemukan tools walau ejaan sedikit salah', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.type(screen.getByPlaceholderText(/cari tools/i), 'kunsi')

  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
})

test('menyaring lewat chip kategori', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: 'Alat Ukur' }))

  expect(screen.getByText('Thermocouple Probe')).toBeInTheDocument()
  expect(screen.queryByText('Kunci Pas 12')).not.toBeInTheDocument()
})

test('menampilkan jumlah dan lokasi ringkas pada kartu', async () => {
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  expect(screen.getByText('4 pcs')).toBeInTheDocument()
  expect(screen.getAllByText(/Melting · Rak A/).length).toBeGreaterThan(0)
})

test('memberi tahu saat tidak ada hasil', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.type(screen.getByPlaceholderText(/cari tools/i), 'xyzabc')

  expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- Home`
Expected: FAIL — kolom pencarian belum ada.

- [ ] **Step 3: Tulis `src/components/ToolCard.tsx`**

```tsx
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
```

- [ ] **Step 4: Tulis `src/components/ScanFab.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { ScanLine } from 'lucide-react'

export function ScanFab() {
  return (
    <Link
      to="/scan"
      aria-label="Scan QR untuk mengembalikan tools"
      className="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-toyota text-white shadow-lg active:bg-toyota-dark"
    >
      <ScanLine className="h-7 w-7" aria-hidden="true" />
    </Link>
  )
}
```

- [ ] **Step 5: Tulis `src/pages/Home.tsx`**

```tsx
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
```

- [ ] **Step 6: Daftarkan rute di `src/App.tsx`**

Tambahkan impor `import Home from '@/pages/Home'` dan ganti baris rute beranda menjadi:

```tsx
<Route path="/" element={<Home />} />
```

- [ ] **Step 7: Jalankan test, pastikan LULUS**

Run: `npm test -- Home`
Expected: PASS (6 test)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add home page with search, category filter, and tool grid"
```

---

### Task 10: Halaman detail tools

**Files:**
- Create: `src/pages/ToolDetail.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/ToolDetail.test.tsx`

**Interfaces:**
- Consumes: `useData()` (Task 8), `formatLocation` (Task 6)
- Produces: halaman `ToolDetail` pada rute `/tools/:id`

Memenuhi FR-B4.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/ToolDetail.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan detail lengkap tools', async () => {
  renderAt('/tools/tool-005')

  await waitFor(() => {
    expect(screen.getByText('Thermocouple Probe')).toBeInTheDocument()
  })

  expect(screen.getByText('Alat Ukur')).toBeInTheDocument()
  expect(screen.getByText('2 pcs')).toBeInTheDocument()
  expect(screen.getByText('Analysis · Rak C · Level 1')).toBeInTheDocument()
  expect(screen.getByText(/tangani hati-hati/i)).toBeInTheDocument()
})

test('menyediakan tautan ke halaman penempatan', async () => {
  renderAt('/tools/tool-005')

  await waitFor(() => {
    expect(screen.getByRole('link', { name: /lihat penempatan/i })).toHaveAttribute(
      'href',
      '/return/tool-005',
    )
  })
})

test('memberi pesan jelas saat tools tidak ada', async () => {
  renderAt('/tools/tool-tidak-ada')

  await waitFor(() => {
    expect(screen.getByText(/tools tidak ditemukan/i)).toBeInTheDocument()
  })
  expect(screen.getByRole('link', { name: /kembali ke pencarian/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- ToolDetail`
Expected: FAIL — rute masih placeholder.

- [ ] **Step 3: Tulis `src/pages/ToolDetail.tsx`**

```tsx
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Package } from 'lucide-react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>()
  const { tools, categories, locations, loading } = useData()

  if (loading) return <p className="p-6 text-center text-neutral-500">Memuat…</p>

  const tool = tools.find((t) => t.id === id)

  if (!tool) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="mb-4 text-lg font-semibold text-neutral-900">
          Tools tidak ditemukan
        </p>
        <p className="mb-6 text-sm text-neutral-500">
          Data mungkin sudah dihapus admin.
        </p>
        <Link
          to="/"
          className="inline-flex h-12 items-center rounded-xl bg-toyota px-5 font-semibold text-white"
        >
          Kembali ke pencarian
        </Link>
      </div>
    )
  }

  const category = categories.find((c) => c.id === tool.category_id)
  const location = locations.find((l) => l.id === tool.location_id)

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <header className="flex items-center gap-2 px-4 py-4">
        <Link
          to="/"
          aria-label="Kembali"
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 active:bg-neutral-200"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="truncate text-lg font-bold">{tool.nama}</h1>
      </header>

      <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-neutral-100">
        {tool.foto_tools_url ? (
          <img
            src={tool.foto_tools_url}
            alt={tool.nama}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-16 w-16 text-neutral-400" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-4 px-4 pt-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-700">
            {category?.nama ?? 'Tanpa kategori'}
          </span>
          <span className="rounded-full bg-toyota/10 px-3 py-1 text-sm font-semibold text-toyota">
            {tool.jumlah} pcs
          </span>
        </div>

        {tool.deskripsi && <p className="text-neutral-700">{tool.deskripsi}</p>}

        <div className="rounded-xl bg-white p-4 ring-1 ring-neutral-200">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Lokasi penempatan
          </p>
          <p className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
            <MapPin className="h-5 w-5 text-toyota" aria-hidden="true" />
            {formatLocation(location)}
          </p>
        </div>

        {tool.keterangan && (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            {tool.keterangan}
          </div>
        )}

        <Link
          to={`/return/${tool.id}`}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-toyota text-base font-semibold text-white active:bg-toyota-dark"
        >
          Lihat penempatan
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Daftarkan rute di `src/App.tsx`**

Tambahkan `import ToolDetail from '@/pages/ToolDetail'` dan ganti rute detail menjadi:

```tsx
<Route path="/tools/:id" element={<ToolDetail />} />
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `npm test -- ToolDetail`
Expected: PASS (3 test)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add tool detail page"
```

---

### Task 11: Halaman "Kembalikan ke sini"

**Files:**
- Create: `src/pages/Return.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/Return.test.tsx`

**Interfaces:**
- Consumes: `useData()` (Task 8), `formatLocation` (Task 6)
- Produces: halaman `Return` pada rute `/return/:id`

Memenuhi FR-C2. Ini layar yang dibaca sambil berdiri memegang tools, jadi foto penempatan dan label lokasi harus paling menonjol.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/Return.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan instruksi pengembalian dan lokasi lengkap', async () => {
  renderAt('/return/tool-001')

  await waitFor(() => {
    expect(screen.getByText(/kembalikan ke sini/i)).toBeInTheDocument()
  })

  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument()
})

test('memberi pesan jelas saat QR menunjuk tools yang sudah dihapus', async () => {
  renderAt('/return/tool-sudah-dihapus')

  await waitFor(() => {
    expect(screen.getByText(/tools tidak ditemukan/i)).toBeInTheDocument()
  })
  expect(screen.getByRole('link', { name: /kembali ke pencarian/i })).toBeInTheDocument()
})

test('memberi tahu saat foto penempatan belum diunggah', async () => {
  renderAt('/return/tool-001')

  await waitFor(() => {
    expect(screen.getByText(/foto penempatan belum diunggah/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- Return`
Expected: FAIL — rute masih placeholder.

- [ ] **Step 3: Tulis `src/pages/Return.tsx`**

```tsx
import { Link, useParams } from 'react-router-dom'
import { ImageOff, MapPin } from 'lucide-react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'

export default function Return() {
  const { id } = useParams<{ id: string }>()
  const { tools, locations, loading } = useData()

  if (loading) return <p className="p-6 text-center text-neutral-500">Memuat…</p>

  const tool = tools.find((t) => t.id === id)

  if (!tool) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="mb-4 text-lg font-semibold text-neutral-900">
          Tools tidak ditemukan
        </p>
        <p className="mb-6 text-sm text-neutral-500">
          QR ini tidak dikenali. Data mungkin sudah dihapus admin.
        </p>
        <Link
          to="/"
          className="inline-flex h-12 items-center rounded-xl bg-toyota px-5 font-semibold text-white"
        >
          Kembali ke pencarian
        </Link>
      </div>
    )
  }

  const location = locations.find((l) => l.id === tool.location_id)

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="bg-toyota px-4 py-5 text-center text-white">
        <p className="text-2xl font-bold uppercase tracking-wide">
          Kembalikan ke sini
        </p>
        <p className="mt-1 text-white/90">{tool.nama}</p>
      </div>

      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-neutral-200">
        {tool.foto_penempatan_url ? (
          <img
            src={tool.foto_penempatan_url}
            alt={`Penempatan ${tool.nama}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <ImageOff className="h-12 w-12" aria-hidden="true" />
            <p className="text-sm">Foto penempatan belum diunggah</p>
          </div>
        )}
      </div>

      <div className="px-4 pt-5">
        <div className="rounded-xl bg-white p-5 text-center ring-1 ring-neutral-200">
          <p className="mb-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            <MapPin className="h-4 w-4 text-toyota" aria-hidden="true" />
            Lokasi
          </p>
          <p className="text-2xl font-bold leading-tight text-neutral-900">
            {formatLocation(location)}
          </p>
        </div>

        {tool.keterangan && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-900 ring-1 ring-amber-200">
            {tool.keterangan}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            to={`/tools/${tool.id}`}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-white font-semibold text-neutral-700 ring-1 ring-neutral-300"
          >
            Detail
          </Link>
          <Link
            to="/scan"
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark"
          >
            Scan lagi
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Daftarkan rute di `src/App.tsx`**

Tambahkan `import Return from '@/pages/Return'` dan ganti rute pengembalian menjadi:

```tsx
<Route path="/return/:id" element={<Return />} />
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `npm test -- Return`
Expected: PASS (3 test)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add return-to-location page"
```

---

### Task 12: Halaman scan QR

**Files:**
- Create: `src/pages/Scan.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/Scan.test.tsx`

**Interfaces:**
- Consumes: `parseScannedValue` (Task 6)
- Produces: halaman `Scan` pada rute `/scan`

Memenuhi FR-C1 (scan kamera) dan FR-C3 (input kode manual).

**Penting soal `html5-qrcode`:** callback error pada `start()` menyala di setiap frame tanpa QR — abaikan diam-diam. Hanya `Promise` yang ditolak dari `start()` yang error sebenarnya (izin ditolak, kamera tidak ada). Di situlah input manual ditawarkan.

Test memakai mock untuk `html5-qrcode` karena jsdom tidak punya kamera. Yang diuji adalah perilaku di sekitarnya: input manual, penanganan izin ditolak, penolakan kode asing. Scan kamera sungguhan diverifikasi di browser pada Task 18.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/Scan.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import App from '@/App'

const startMock = vi.fn()
const stopMock = vi.fn()

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: class {
    start = startMock
    stop = stopMock
    clear = vi.fn()
  },
}))

beforeEach(() => {
  localStorage.clear()
  startMock.mockReset().mockResolvedValue(undefined)
  stopMock.mockReset().mockResolvedValue(undefined)
})

function renderScan() {
  return render(
    <MemoryRouter initialEntries={['/scan']}>
      <App />
    </MemoryRouter>,
  )
}

test('menawarkan input manual saat izin kamera ditolak', async () => {
  startMock.mockRejectedValue(new Error('Permission denied'))
  renderScan()

  await waitFor(() => {
    expect(screen.getByText(/kamera tidak bisa dipakai/i)).toBeInTheDocument()
  })
  expect(screen.getByLabelText(/kode tools/i)).toBeInTheDocument()
})

test('membuka halaman pengembalian dari kode manual', async () => {
  const user = userEvent.setup()
  renderScan()

  await user.type(screen.getByLabelText(/kode tools/i), 'tool-001')
  await user.click(screen.getByRole('button', { name: /buka/i }))

  await waitFor(() => {
    expect(screen.getByText(/kembalikan ke sini/i)).toBeInTheDocument()
  })
  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
})

test('menolak kode yang tidak dikenali', async () => {
  const user = userEvent.setup()
  renderScan()

  await user.type(screen.getByLabelText(/kode tools/i), 'halo dunia')
  await user.click(screen.getByRole('button', { name: /buka/i }))

  expect(screen.getByText(/kode tidak dikenali/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- Scan`
Expected: FAIL — rute masih placeholder.

- [ ] **Step 3: Tulis `src/pages/Scan.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { parseScannedValue } from '@/lib/qr'

const READER_ID = 'qr-reader'

export default function Scan() {
  const navigate = useNavigate()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [cameraFailed, setCameraFailed] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(READER_ID)
    scannerRef.current = scanner
    let cancelled = false

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const id = parseScannedValue(decodedText)
          if (!id) return // QR asing — biarkan scanner terus mencari.
          void scanner.stop().catch(() => {})
          navigate(`/return/${id}`)
        },
        // Menyala di setiap frame tanpa QR. Bukan error — abaikan.
        undefined,
      )
      .catch(() => {
        if (!cancelled) setCameraFailed(true)
      })

    return () => {
      cancelled = true
      scanner.stop().catch(() => {})
    }
  }, [navigate])

  function openManual() {
    const id = parseScannedValue(manualCode)
    if (!id) {
      setManualError('Kode tidak dikenali. Periksa kembali kode pada label.')
      return
    }
    navigate(`/return/${id}`)
  }

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <header className="flex items-center gap-2 px-4 py-4">
        <Link
          to="/"
          aria-label="Kembali"
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 active:bg-neutral-200"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-lg font-bold">Scan QR Tools</h1>
      </header>

      <div className="px-4">
        <div
          id={READER_ID}
          className="overflow-hidden rounded-xl bg-black"
          hidden={cameraFailed}
        />

        {cameraFailed && (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            Kamera tidak bisa dipakai. Izinkan akses kamera di browser, atau
            masukkan kode tools secara manual di bawah.
          </div>
        )}

        {!cameraFailed && (
          <p className="pt-3 text-center text-sm text-neutral-500">
            Arahkan kamera ke QR code pada tools.
          </p>
        )}

        <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-neutral-200">
          <label
            htmlFor="manual-code"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            Kode tools (manual)
          </label>
          <div className="flex gap-2">
            <input
              id="manual-code"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value)
                setManualError(null)
              }}
              placeholder="tool-001"
              className="h-12 flex-1 rounded-xl border border-neutral-200 px-3 text-base outline-none focus:border-toyota focus:ring-2 focus:ring-toyota/20"
            />
            <button
              type="button"
              onClick={openManual}
              className="h-12 rounded-xl bg-toyota px-5 font-semibold text-white active:bg-toyota-dark"
            >
              Buka
            </button>
          </div>
          {manualError && (
            <p className="mt-2 text-sm text-toyota">{manualError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Daftarkan rute di `src/App.tsx`**

Tambahkan `import Scan from '@/pages/Scan'` dan ganti rute scan menjadi:

```tsx
<Route path="/scan" element={<Scan />} />
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `npm test -- Scan`
Expected: PASS (3 test)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add qr scan page with manual code fallback"
```

---

### Task 13: Autentikasi admin

**Files:**
- Create: `src/auth/AuthProvider.tsx`, `src/auth/RequireAuth.tsx`, `src/pages/admin/Login.tsx`
- Modify: `src/App.tsx`
- Test: `src/auth/AuthProvider.test.tsx`

**Interfaces:**
- Consumes: `ADMIN_CREDENTIAL` (Task 3), tipe `AdminSession` (Task 2)
- Produces: `<AuthProvider>`, `useAuth(): AuthState`, `<RequireAuth>`, halaman `Login`, konstanta `SESSION_KEY = 'tool-locator:session:v1'`

```typescript
type AuthState = {
  session: AdminSession | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```

Memenuhi FR-D1 dan FR-D2 (sisi klien). Bentuk API sengaja meniru Supabase Auth agar penukaran nanti tidak menyentuh komponen.

**Catatan urutan:** dua test terakhir bergantung pada halaman `/admin/tools` dari Task 14, jadi keduanya masih merah sampai Task 14 selesai. Itu disengaja — jangan menambalnya dengan placeholder.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/auth/AuthProvider.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan form login saat belum ada sesi', async () => {
  renderAt('/admin')
  await waitFor(() => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
  expect(screen.getByLabelText(/kata sandi/i)).toBeInTheDocument()
})

test('menolak kredensial yang salah', async () => {
  const user = userEvent.setup()
  renderAt('/admin')

  await user.type(screen.getByLabelText(/email/i), 'admin@tmmin.local')
  await user.type(screen.getByLabelText(/kata sandi/i), 'salah')
  await user.click(screen.getByRole('button', { name: /masuk/i }))

  await waitFor(() => {
    expect(screen.getByText(/email atau kata sandi salah/i)).toBeInTheDocument()
  })
})

test('mengalihkan ke daftar tools setelah login berhasil', async () => {
  const user = userEvent.setup()
  renderAt('/admin')

  await user.type(screen.getByLabelText(/email/i), 'admin@tmmin.local')
  await user.type(screen.getByLabelText(/kata sandi/i), 'admin123')
  await user.click(screen.getByRole('button', { name: /masuk/i }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /kelola tools/i })).toBeInTheDocument()
  })
})

test('menjaga rute admin dari akses tanpa sesi', async () => {
  renderAt('/admin/tools')
  await waitFor(() => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- AuthProvider`
Expected: FAIL — rute `/admin` belum ada.

- [ ] **Step 3: Tulis `src/auth/AuthProvider.tsx`**

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AdminSession } from '@/data/types'
import { ADMIN_CREDENTIAL } from '@/data/seed'

export const SESSION_KEY = 'tool-locator:session:v1'

export type AuthState = {
  session: AdminSession | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function readSession(): AdminSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(readSession)

  const signIn = useCallback(async (email: string, password: string) => {
    const ok =
      email.trim().toLowerCase() === ADMIN_CREDENTIAL.email &&
      password === ADMIN_CREDENTIAL.password
    if (!ok) throw new Error('Email atau kata sandi salah')

    const next: AdminSession = { email: ADMIN_CREDENTIAL.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const signOut = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ session, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return context
}
```

- [ ] **Step 4: Tulis `src/auth/RequireAuth.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/admin" replace />
  return <>{children}</>
}
```

- [ ] **Step 5: Tulis `src/pages/admin/Login.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'

export default function Login() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/admin/tools" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal masuk')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-10">
      <header className="flex items-center gap-2 py-4">
        <Link
          to="/"
          aria-label="Kembali"
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 active:bg-neutral-200"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-lg font-bold">Masuk Admin</h1>
      </header>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-neutral-200"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota focus:ring-2 focus:ring-toyota/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Kata sandi
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota focus:ring-2 focus:ring-toyota/20"
          />
        </div>

        {error && <p className="text-sm text-toyota">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark disabled:opacity-60"
        >
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 6: Bungkus aplikasi dengan `AuthProvider` dan daftarkan rute login**

Di `src/App.tsx`: tambahkan impor `AuthProvider` dan `Login`, bungkus `<Routes>` dengan `<AuthProvider>` (di dalam `<DataProvider>`), lalu tambahkan rute:

```tsx
<Route path="/admin" element={<Login />} />
```

- [ ] **Step 7: Jalankan test**

Run: `npm test -- AuthProvider`
Expected: dua test pertama PASS; dua terakhir masih FAIL sampai Task 14 membuat `/admin/tools`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add stubbed admin auth and login page"
```

---

### Task 14: Panel admin — kelola tools

**Files:**
- Create: `src/pages/admin/AdminLayout.tsx`, `src/pages/admin/Tools.tsx`, `src/components/PhotoInput.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/admin/Tools.test.tsx`

**Interfaces:**
- Consumes: `useData()` (Task 8), `useAuth()` (Task 13), `compressImage` (Task 7), `formatLocation` (Task 6), `buildQrUrl` (Task 6)
- Produces: `AdminLayout` dengan props `{ children: ReactNode }`, halaman `AdminTools` pada `/admin/tools`, komponen `PhotoInput` dengan props `{ label: string; value?: string; onChange: (dataUrl: string | undefined) => void }`

Memenuhi FR-A1, FR-A2, FR-A5, FR-A7, FR-A8.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/admin/Tools.test.tsx`:

```tsx
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import App from '@/App'

vi.mock('@/lib/image', async () => {
  const actual = await vi.importActual<typeof import('@/lib/image')>('@/lib/image')
  return {
    ...actual,
    compressImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,xxx'),
  }
})

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'tool-locator:session:v1',
    JSON.stringify({ email: 'admin@tmmin.local' }),
  )
})

function renderAdmin() {
  return render(
    <MemoryRouter initialEntries={['/admin/tools']}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan daftar tools yang ada', async () => {
  renderAdmin()
  await waitFor(() => {
    expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  })
})

test('menambah tools baru lewat form', async () => {
  const user = userEvent.setup()
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: /tambah tools/i }))

  await user.type(screen.getByLabelText(/nama tools/i), 'Kuas Coating')
  await user.selectOptions(screen.getByLabelText(/kategori/i), 'cat-pouring')
  await user.selectOptions(screen.getByLabelText(/^area$/i), 'Pouring')
  await user.selectOptions(screen.getByLabelText(/^rak$/i), 'Rak B')
  await user.selectOptions(screen.getByLabelText(/level \/ bin/i), 'loc-pouring-b1')
  await user.clear(screen.getByLabelText(/jumlah/i))
  await user.type(screen.getByLabelText(/jumlah/i), '7')
  await user.click(screen.getByRole('button', { name: /simpan/i }))

  await waitFor(() => {
    expect(screen.getByText('Kuas Coating')).toBeInTheDocument()
  })
})

test('menolak simpan saat nama kosong', async () => {
  const user = userEvent.setup()
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: /tambah tools/i }))
  await user.click(screen.getByRole('button', { name: /simpan/i }))

  expect(screen.getByText(/nama tools wajib diisi/i)).toBeInTheDocument()
})

test('menghapus tools setelah dikonfirmasi', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Sekop Pasir')).toBeInTheDocument())

  const row = screen.getByText('Sekop Pasir').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.queryByText('Sekop Pasir')).not.toBeInTheDocument()
  })
})

test('menampilkan pratinjau QR saat mengubah tools', async () => {
  const user = userEvent.setup()
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  const row = screen.getByText('Kunci Pas 12').closest('li')!
  await user.click(within(row).getByRole('button', { name: /ubah/i }))

  expect(screen.getByTestId('qr-preview')).toBeInTheDocument()
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- admin/Tools`
Expected: FAIL — rute `/admin/tools` belum ada.

- [ ] **Step 3: Tulis `src/components/PhotoInput.tsx`**

```tsx
import { useState, type ChangeEvent } from 'react'
import { compressImage } from '@/lib/image'

type Props = {
  label: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
}

export function PhotoInput({ label, value, onChange }: Props) {
  const [error, setError] = useState<string | null>(null)
  const inputId = `photo-${label.replace(/\s+/g, '-').toLowerCase()}`

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      onChange(await compressImage(file))
    } catch {
      // Foto gagal dibaca bukan alasan menggagalkan seluruh form —
      // tools tetap berguna tanpa foto.
      setError('Foto gagal diproses. Tools tetap bisa disimpan tanpa foto.')
      onChange(undefined)
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
        {label}
      </label>

      {value && (
        <img
          src={value}
          alt={label}
          className="mb-2 h-24 w-24 rounded-lg object-cover ring-1 ring-neutral-200"
        />
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={pick}
        className="block w-full text-sm text-neutral-600 file:mr-3 file:h-10 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:font-medium"
      />

      {error && <p className="mt-1 text-sm text-toyota">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Tulis `src/pages/admin/AdminLayout.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'

const tabs = [
  { to: '/admin/tools', label: 'Tools' },
  { to: '/admin/categories', label: 'Kategori' },
  { to: '/admin/locations', label: 'Lokasi' },
  { to: '/admin/labels', label: 'Label QR' },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function keluar() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <header className="px-4 pt-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg font-bold">
            Panel <span className="text-toyota">Admin</span>
          </Link>
          <button
            type="button"
            onClick={keluar}
            className="flex h-10 items-center gap-2 rounded-full px-3 text-sm text-neutral-600 active:bg-neutral-200"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Keluar
          </button>
        </div>

        <nav className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `h-9 shrink-0 rounded-full px-4 text-sm font-medium leading-9 ${
                  isActive
                    ? 'bg-toyota text-white'
                    : 'bg-white text-neutral-700 ring-1 ring-neutral-200'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-4 pt-4">{children}</main>
    </div>
  )
}
```

- [ ] **Step 5: Tulis `src/pages/admin/Tools.tsx`**

```tsx
import { useMemo, useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'
import { buildQrUrl } from '@/lib/qr'
import { AdminLayout } from './AdminLayout'
import { PhotoInput } from '@/components/PhotoInput'
import type { Tool, ToolInput } from '@/data/types'

const kosong: ToolInput = {
  nama: '',
  deskripsi: '',
  category_id: '',
  location_id: '',
  jumlah: 1,
  keterangan: '',
}

export default function AdminTools() {
  const { tools, categories, locations, repo, refresh } = useData()
  const [draft, setDraft] = useState<ToolInput | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [area, setArea] = useState('')
  const [rak, setRak] = useState('')

  const areas = useMemo(
    () => [...new Set(locations.map((l) => l.area))],
    [locations],
  )
  const raks = useMemo(
    () => [...new Set(locations.filter((l) => l.area === area).map((l) => l.rak))],
    [locations, area],
  )
  const bins = useMemo(
    () => locations.filter((l) => l.area === area && l.rak === rak),
    [locations, area, rak],
  )

  function mulaiTambah() {
    setDraft({ ...kosong })
    setArea('')
    setRak('')
    setError(null)
  }

  function mulaiUbah(tool: Tool) {
    const { id, qr_value: _qrValue, ...rest } = tool
    setDraft({ ...rest, id })
    const location = locations.find((l) => l.id === tool.location_id)
    setArea(location?.area ?? '')
    setRak(location?.rak ?? '')
    setError(null)
  }

  async function simpan(event: FormEvent) {
    event.preventDefault()
    if (!draft) return

    if (draft.nama.trim() === '') {
      setError('Nama tools wajib diisi')
      return
    }
    if (draft.category_id === '') {
      setError('Kategori wajib dipilih')
      return
    }
    if (draft.location_id === '') {
      setError('Lokasi wajib dipilih sampai Level / Bin')
      return
    }
    if (!Number.isFinite(draft.jumlah) || draft.jumlah < 1) {
      setError('Jumlah minimal 1')
      return
    }

    try {
      await repo.saveTool(draft)
      await refresh()
      setDraft(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    }
  }

  async function hapus(tool: Tool) {
    if (!window.confirm(`Hapus "${tool.nama}"?`)) return
    try {
      await repo.deleteTool(tool.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Kelola Tools</h1>
        <button
          type="button"
          onClick={mulaiTambah}
          className="h-10 rounded-xl bg-toyota px-4 text-sm font-semibold text-white active:bg-toyota-dark"
        >
          Tambah tools
        </button>
      </div>

      {draft && (
        <form
          onSubmit={simpan}
          className="mb-6 space-y-4 rounded-xl bg-white p-4 ring-1 ring-neutral-200"
        >
          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-medium">
              Nama tools
            </label>
            <input
              id="nama"
              value={draft.nama}
              onChange={(e) => setDraft({ ...draft, nama: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          <div>
            <label htmlFor="deskripsi" className="mb-1 block text-sm font-medium">
              Deskripsi
            </label>
            <input
              id="deskripsi"
              value={draft.deskripsi ?? ''}
              onChange={(e) => setDraft({ ...draft, deskripsi: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          <div>
            <label htmlFor="kategori" className="mb-1 block text-sm font-medium">
              Kategori
            </label>
            <select
              id="kategori"
              value={draft.category_id}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3"
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="area" className="mb-1 block text-sm font-medium">
                Area
              </label>
              <select
                id="area"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value)
                  setRak('')
                  setDraft({ ...draft, location_id: '' })
                }}
                className="h-12 w-full rounded-xl border border-neutral-200 px-2"
              >
                <option value="">Pilih</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rak" className="mb-1 block text-sm font-medium">
                Rak
              </label>
              <select
                id="rak"
                value={rak}
                disabled={area === ''}
                onChange={(e) => {
                  setRak(e.target.value)
                  setDraft({ ...draft, location_id: '' })
                }}
                className="h-12 w-full rounded-xl border border-neutral-200 px-2 disabled:bg-neutral-100"
              >
                <option value="">Pilih</option>
                {raks.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bin" className="mb-1 block text-sm font-medium">
                Level / Bin
              </label>
              <select
                id="bin"
                value={draft.location_id}
                disabled={rak === ''}
                onChange={(e) => setDraft({ ...draft, location_id: e.target.value })}
                className="h-12 w-full rounded-xl border border-neutral-200 px-2 disabled:bg-neutral-100"
              >
                <option value="">Pilih</option>
                {bins.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.level_bin}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="jumlah" className="mb-1 block text-sm font-medium">
              Jumlah
            </label>
            <input
              id="jumlah"
              type="number"
              min={1}
              value={draft.jumlah}
              onChange={(e) =>
                setDraft({ ...draft, jumlah: Number(e.target.value) })
              }
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          <PhotoInput
            label="Foto tools"
            value={draft.foto_tools_url}
            onChange={(url) => setDraft({ ...draft, foto_tools_url: url })}
          />

          <PhotoInput
            label="Foto penempatan"
            value={draft.foto_penempatan_url}
            onChange={(url) => setDraft({ ...draft, foto_penempatan_url: url })}
          />

          <div>
            <label htmlFor="keterangan" className="mb-1 block text-sm font-medium">
              Keterangan
            </label>
            <input
              id="keterangan"
              value={draft.keterangan ?? ''}
              onChange={(e) => setDraft({ ...draft, keterangan: e.target.value })}
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>

          {draft.id && (
            <div className="rounded-xl bg-neutral-50 p-4 text-center">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Pratinjau QR
              </p>
              <div data-testid="qr-preview" className="inline-block bg-white p-2">
                <QRCodeSVG
                  value={buildQrUrl(window.location.origin, draft.id)}
                  size={120}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-toyota">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="h-12 flex-1 rounded-xl bg-white font-semibold text-neutral-700 ring-1 ring-neutral-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-12 flex-1 rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {tools.map((tool) => (
          <li
            key={tool.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{tool.nama}</p>
              <p className="truncate text-xs text-neutral-500">
                {formatLocation(locations.find((l) => l.id === tool.location_id))}
                {' · '}
                {tool.jumlah} pcs
              </p>
            </div>
            <button
              type="button"
              onClick={() => mulaiUbah(tool)}
              className="h-10 rounded-lg px-3 text-sm font-medium text-neutral-700 ring-1 ring-neutral-300"
            >
              Ubah
            </button>
            <button
              type="button"
              onClick={() => hapus(tool)}
              className="h-10 rounded-lg px-3 text-sm font-medium text-toyota ring-1 ring-toyota/30"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}
```

- [ ] **Step 6: Daftarkan rute terjaga di `src/App.tsx`**

Tambahkan impor `RequireAuth` dan `AdminTools`, lalu:

```tsx
<Route
  path="/admin/tools"
  element={
    <RequireAuth>
      <AdminTools />
    </RequireAuth>
  }
/>
```

- [ ] **Step 7: Jalankan test, pastikan LULUS**

Run: `npm test -- admin/Tools AuthProvider`
Expected: PASS — termasuk dua test Task 13 yang tadi merah.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add admin tools management with photo upload and qr preview"
```

---

### Task 15: Panel admin — kelola kategori

**Files:**
- Create: `src/pages/admin/Categories.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/admin/Categories.test.tsx`

**Interfaces:**
- Consumes: `useData()` (Task 8), `AdminLayout` (Task 14)
- Produces: halaman `AdminCategories` pada `/admin/categories`

Memenuhi FR-A3.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/admin/Categories.test.tsx`:

```tsx
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'tool-locator:session:v1',
    JSON.stringify({ email: 'admin@tmmin.local' }),
  )
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/categories']}>
      <App />
    </MemoryRouter>,
  )
}

test('menambah kategori baru', async () => {
  const user = userEvent.setup()
  renderPage()
  await waitFor(() => expect(screen.getByText('Kunci & Tang')).toBeInTheDocument())

  await user.type(screen.getByLabelText(/nama kategori/i), 'Alat Kebersihan')
  await user.click(screen.getByRole('button', { name: /tambah/i }))

  await waitFor(() => {
    expect(screen.getByText('Alat Kebersihan')).toBeInTheDocument()
  })
})

test('menolak hapus kategori yang masih dipakai tools', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderPage()
  await waitFor(() => expect(screen.getByText('Kunci & Tang')).toBeInTheDocument())

  const row = screen.getByText('Kunci & Tang').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.getByText(/masih dipakai/i)).toBeInTheDocument()
  })
  expect(screen.getByText('Kunci & Tang')).toBeInTheDocument()
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- admin/Categories`
Expected: FAIL — rute `/admin/categories` belum ada.

- [ ] **Step 3: Tulis `src/pages/admin/Categories.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { useData } from '@/data/DataProvider'
import { AdminLayout } from './AdminLayout'
import type { Category } from '@/data/types'

export default function AdminCategories() {
  const { categories, repo, refresh } = useData()
  const [nama, setNama] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function tambah(event: FormEvent) {
    event.preventDefault()
    if (nama.trim() === '') {
      setError('Nama kategori wajib diisi')
      return
    }
    setError(null)
    try {
      await repo.saveCategory({ nama: nama.trim() })
      await refresh()
      setNama('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    }
  }

  async function hapus(category: Category) {
    if (!window.confirm(`Hapus kategori "${category.nama}"?`)) return
    setError(null)
    try {
      await repo.deleteCategory(category.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-4 text-lg font-bold">Kelola Kategori</h1>

      <form
        onSubmit={tambah}
        className="mb-4 rounded-xl bg-white p-4 ring-1 ring-neutral-200"
      >
        <label htmlFor="nama-kategori" className="mb-1 block text-sm font-medium">
          Nama kategori
        </label>
        <div className="flex gap-2">
          <input
            id="nama-kategori"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="h-12 flex-1 rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
          />
          <button
            type="submit"
            className="h-12 rounded-xl bg-toyota px-5 font-semibold text-white active:bg-toyota-dark"
          >
            Tambah
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-toyota">{error}</p>}
      </form>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200"
          >
            <p className="min-w-0 flex-1 truncate font-medium">{category.nama}</p>
            <button
              type="button"
              onClick={() => hapus(category)}
              className="h-10 rounded-lg px-3 text-sm font-medium text-toyota ring-1 ring-toyota/30"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}
```

- [ ] **Step 4: Daftarkan rute terjaga di `src/App.tsx`**

```tsx
<Route
  path="/admin/categories"
  element={
    <RequireAuth>
      <AdminCategories />
    </RequireAuth>
  }
/>
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `npm test -- admin/Categories`
Expected: PASS (2 test)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add admin category management"
```

---

### Task 16: Panel admin — kelola lokasi

**Files:**
- Create: `src/pages/admin/Locations.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/admin/Locations.test.tsx`

**Interfaces:**
- Consumes: `useData()` (Task 8), `AdminLayout` (Task 14), `formatLocation` (Task 6)
- Produces: halaman `AdminLocations` pada `/admin/locations`

Memenuhi FR-A4.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/admin/Locations.test.tsx`:

```tsx
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'tool-locator:session:v1',
    JSON.stringify({ email: 'admin@tmmin.local' }),
  )
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/locations']}>
      <App />
    </MemoryRouter>,
  )
}

test('menambah lokasi baru', async () => {
  const user = userEvent.setup()
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  await user.type(screen.getByLabelText(/^area$/i), 'Finishing')
  await user.type(screen.getByLabelText(/^rak$/i), 'Rak D')
  await user.type(screen.getByLabelText(/level \/ bin/i), 'Level 1')
  await user.click(screen.getByRole('button', { name: /tambah lokasi/i }))

  await waitFor(() => {
    expect(screen.getByText('Finishing · Rak D · Level 1')).toBeInTheDocument()
  })
})

test('menolak simpan saat ada bagian lokasi yang kosong', async () => {
  const user = userEvent.setup()
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  await user.type(screen.getByLabelText(/^area$/i), 'Finishing')
  await user.click(screen.getByRole('button', { name: /tambah lokasi/i }))

  expect(
    screen.getByText(/area, rak, dan level \/ bin wajib diisi/i),
  ).toBeInTheDocument()
})

test('menolak hapus lokasi yang masih dipakai tools', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  const row = screen.getByText('Melting · Rak A · Level 1').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.getByText(/masih dipakai/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- admin/Locations`
Expected: FAIL — rute `/admin/locations` belum ada.

- [ ] **Step 3: Tulis `src/pages/admin/Locations.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { useData } from '@/data/DataProvider'
import { formatLocation } from '@/lib/format'
import { AdminLayout } from './AdminLayout'
import type { Location } from '@/data/types'

export default function AdminLocations() {
  const { locations, repo, refresh } = useData()
  const [area, setArea] = useState('')
  const [rak, setRak] = useState('')
  const [levelBin, setLevelBin] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function tambah(event: FormEvent) {
    event.preventDefault()
    if (area.trim() === '' || rak.trim() === '' || levelBin.trim() === '') {
      setError('Area, rak, dan level / bin wajib diisi')
      return
    }
    setError(null)
    try {
      await repo.saveLocation({
        area: area.trim(),
        rak: rak.trim(),
        level_bin: levelBin.trim(),
      })
      await refresh()
      setArea('')
      setRak('')
      setLevelBin('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    }
  }

  async function hapus(location: Location) {
    if (!window.confirm(`Hapus lokasi "${formatLocation(location)}"?`)) return
    setError(null)
    try {
      await repo.deleteLocation(location.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus')
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-4 text-lg font-bold">Kelola Lokasi</h1>

      <form
        onSubmit={tambah}
        className="mb-4 space-y-3 rounded-xl bg-white p-4 ring-1 ring-neutral-200"
      >
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="area" className="mb-1 block text-sm font-medium">
              Area
            </label>
            <input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Melting"
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>
          <div>
            <label htmlFor="rak" className="mb-1 block text-sm font-medium">
              Rak
            </label>
            <input
              id="rak"
              value={rak}
              onChange={(e) => setRak(e.target.value)}
              placeholder="Rak A"
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>
          <div>
            <label htmlFor="level-bin" className="mb-1 block text-sm font-medium">
              Level / Bin
            </label>
            <input
              id="level-bin"
              value={levelBin}
              onChange={(e) => setLevelBin(e.target.value)}
              placeholder="Level 2"
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:border-toyota"
            />
          </div>
        </div>

        {error && <p className="text-sm text-toyota">{error}</p>}

        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-toyota font-semibold text-white active:bg-toyota-dark"
        >
          Tambah lokasi
        </button>
      </form>

      <ul className="space-y-2">
        {locations.map((location) => (
          <li
            key={location.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-neutral-200"
          >
            <p className="min-w-0 flex-1 truncate font-medium">
              {formatLocation(location)}
            </p>
            <button
              type="button"
              onClick={() => hapus(location)}
              className="h-10 rounded-lg px-3 text-sm font-medium text-toyota ring-1 ring-toyota/30"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}
```

- [ ] **Step 4: Daftarkan rute terjaga di `src/App.tsx`**

```tsx
<Route
  path="/admin/locations"
  element={
    <RequireAuth>
      <AdminLocations />
    </RequireAuth>
  }
/>
```

- [ ] **Step 5: Jalankan test, pastikan LULUS**

Run: `npm test -- admin/Locations`
Expected: PASS (3 test)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add admin location management"
```

---

### Task 17: Lembar label QR siap cetak

**Files:**
- Create: `src/pages/admin/Labels.tsx`
- Modify: `src/App.tsx`, `src/index.css`
- Test: `src/pages/admin/Labels.test.tsx`

**Interfaces:**
- Consumes: `useData()` (Task 8), `AdminLayout` (Task 14), `buildQrUrl` (Task 6), `formatLocation` (Task 6)
- Produces: halaman `AdminLabels` pada `/admin/labels`

Memenuhi FR-A6. Ingat: `react-to-print` v3 memakai `useReactToPrint({ contentRef })`.

- [ ] **Step 1: Tulis test yang gagal**

Tulis `src/pages/admin/Labels.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'tool-locator:session:v1',
    JSON.stringify({ email: 'admin@tmmin.local' }),
  )
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/labels']}>
      <App />
    </MemoryRouter>,
  )
}

test('membuat satu label untuk setiap tools', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getAllByTestId('qr-label')).toHaveLength(8)
  })
})

test('setiap label memuat nama dan lokasi tools', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  })
  expect(screen.getAllByText('Melting · Rak A · Level 1').length).toBeGreaterThan(0)
})

test('menyediakan tombol cetak', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /cetak/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm test -- admin/Labels`
Expected: FAIL — rute `/admin/labels` belum ada.

- [ ] **Step 3: Tulis `src/pages/admin/Labels.tsx`**

```tsx
import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import { useData } from '@/data/DataProvider'
import { buildQrUrl } from '@/lib/qr'
import { formatLocation } from '@/lib/format'
import { AdminLayout } from './AdminLayout'

export default function AdminLabels() {
  const { tools, locations } = useData()
  const contentRef = useRef<HTMLDivElement>(null)

  const cetak = useReactToPrint({
    contentRef,
    documentTitle: 'Label QR Tool Locator',
  })

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Label QR</h1>
        <button
          type="button"
          onClick={() => cetak()}
          className="flex h-10 items-center gap-2 rounded-xl bg-toyota px-4 text-sm font-semibold text-white active:bg-toyota-dark"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Cetak
        </button>
      </div>

      <p className="mb-4 text-sm text-neutral-500">
        Tempel label pada tools atau rak. Laminasi agar tahan di lapangan.
      </p>

      <div ref={contentRef} className="print-sheet grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            data-testid="qr-label"
            className="flex break-inside-avoid flex-col items-center gap-2 rounded-lg border border-neutral-300 bg-white p-3 text-center"
          >
            <QRCodeSVG
              value={buildQrUrl(window.location.origin, tool.id)}
              size={110}
              level="M"
            />
            <p className="text-sm font-bold leading-tight">{tool.nama}</p>
            <p className="text-[10px] leading-tight text-neutral-600">
              {formatLocation(locations.find((l) => l.id === tool.location_id))}
            </p>
            <p className="text-[9px] text-neutral-400">{tool.id}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
```

- [ ] **Step 4: Tambahkan aturan cetak ke `src/index.css`**

```css
@media print {
  body {
    background: white;
  }

  .print-sheet {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8mm;
  }
}

@page {
  size: A4;
  margin: 10mm;
}
```

- [ ] **Step 5: Daftarkan rute terjaga di `src/App.tsx`**

```tsx
<Route
  path="/admin/labels"
  element={
    <RequireAuth>
      <AdminLabels />
    </RequireAuth>
  }
/>
```

- [ ] **Step 6: Jalankan seluruh test, pastikan LULUS**

Run: `npm test`
Expected: PASS — seluruh test Task 1–17.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add printable qr label sheet"
```

---

### Task 18: Verifikasi di browser

**Files:** tidak ada perubahan kode yang direncanakan — task ini menemukan apakah ada yang perlu diperbaiki.

**Interfaces:**
- Consumes: seluruh aplikasi
- Produces: laporan hasil verifikasi; perbaikan bila ada temuan

Tiga hal yang test unit **tidak bisa** buktikan, karena jsdom tidak punya kamera, kanvas asli, maupun mesin cetak. Kalau ada yang rusak di sini, seluruh alur lapangan ikut rusak — jadi task ini wajib, bukan pelengkap.

- [ ] **Step 1: Jalankan aplikasi**

Run: `npm run dev`
Expected: server hidup di `http://localhost:5173`.

- [ ] **Step 2: Verifikasi kompresi foto sungguhan**

Buka `/admin` → masuk dengan `admin@tmmin.local` / `admin123` → Tools → Tambah tools → unggah foto berukuran besar (>2 MB) pada "Foto tools".

Expected: pratinjau muncul. Di konsol browser, jalankan `localStorage.getItem('tool-locator:data:v1').length` — panjangnya harus jauh di bawah ukuran foto asli, membuktikan kompresi bekerja (kanvas, bukan mock).

- [ ] **Step 3: Verifikasi lembar label cetak**

Buka `/admin/labels` → klik Cetak → periksa pratinjau cetak.

Expected: label tersusun 3 kolom di kertas A4, QR tidak terpotong, nama dan lokasi terbaca, tanpa navigasi admin ikut tercetak.

- [ ] **Step 4: Verifikasi scan kamera di HP**

Kamera browser butuh HTTPS atau localhost — dari HP, `http://<ip-laptop>:5173` akan ditolak. Jalankan lewat terowongan HTTPS, atau `npm run dev -- --host` lalu akses via HTTPS.

Cetak satu label dari Step 3, lalu dari HP buka `/scan` dan arahkan ke QR.

Expected: halaman "Kembalikan ke sini" terbuka untuk tools yang benar; foto penempatan dan lokasi terbaca sambil berdiri. Konsol tidak dibanjiri pesan error dari frame tanpa QR.

- [ ] **Step 5: Verifikasi QR sebagai deep-link**

Dari kamera bawaan HP (bukan aplikasi), arahkan ke label yang sama.

Expected: HP menawarkan membuka URL, dan URL itu mendarat di halaman "Kembalikan ke sini" yang benar.

- [ ] **Step 6: Verifikasi jalur kegagalan kamera**

Tolak izin kamera di browser, lalu buka `/scan`.

Expected: pesan "Kamera tidak bisa dipakai" muncul dan input kode manual tersedia — bukan layar hitam tanpa jalan keluar.

- [ ] **Step 7: Catat dan perbaiki temuan**

Bila ada yang meleset, perbaiki dan jalankan `npm test` sebelum commit.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix: address browser verification findings"
```

---

## Catatan Penyimpangan dari Spec & PRD

Dicatat supaya reviewer tidak perlu menebak apakah ini kelalaian:

1. **Pengujian `image.ts`** — spec awal menyebut "kompresi menghasilkan gambar lebih kecil dari aslinya" sebagai test unit. jsdom tidak mengimplementasikan `canvas.toDataURL`, jadi test semacam itu hanya akan membuktikan mock-nya jalan. Yang diuji unit adalah `fitDimensions` (fungsi murni); kompresi sebenarnya diverifikasi di browser pada Task 18 Step 2. Spec sudah disesuaikan.

2. **Penjagaan hapus kategori/lokasi** — tidak diminta eksplisit di PRD, tapi tanpa ini menghapus kategori akan meninggalkan tools yang menunjuk kategori hantu. Ditambahkan di `MockRepository` dengan test, dan dicatat di tabel penanganan kesalahan pada spec.

3. **Nilai QR tercetak** — PRD 7.2 menyebut QR berisi ID tools. Label yang dicetak meng-encode URL lengkap `<origin>/return/<id>`, sebab kamera bawaan HP hanya bisa membuka URL. Field `qr_value` tetap berisi ID sesuai PRD. Sudah dijelaskan di spec bagian 7.

4. **shadcn/ui tidak dipakai** — PRD bagian 9 menyebut shadcn/ui. Rencana ini memakai Tailwind langsung dengan komponen kecil buatan sendiri (`ToolCard`, `PhotoInput`, `CategoryChip`, `ScanFab`). Alasannya: shadcn/ui adalah pustaka salin-tempel, dan komponen yang aplikasi ini butuhkan sedikit serta sederhana — menariknya lewat CLI menambah `components.json`, dependensi Radix, dan berkas yang tidak terpakai tanpa manfaat sepadan. Bila Anda ingin tetap memakai shadcn/ui demi konsistensi lintas aplikasi di Casting Tools Hub, katakan dan rencana ini disesuaikan.
