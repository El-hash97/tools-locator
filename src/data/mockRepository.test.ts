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
    await expect(repo().deleteCategory('cat-kunci')).rejects.toThrow(
      /masih dipakai/i,
    )
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
