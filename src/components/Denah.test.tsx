import { beforeEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Denah, DenahLegend } from './Denah'
import { MockRepository, STORAGE_KEY } from '@/data/mockRepository'
import { seedZones } from '@/data/seed'

beforeEach(() => {
  localStorage.clear()
})

test('titik yang disorot memakai warna dan posisi zona-nya', () => {
  const zone = seedZones[1]
  render(<Denah zones={seedZones} highlightId={zone.id} />)

  const marker = screen.getByTestId('denah-highlight')
  expect(marker).toHaveStyle({ left: `${zone.x}%`, top: `${zone.y}%` })
  // Lingkaran berkedip + titik padat, keduanya berwarna sama dengan zona.
  expect(marker.querySelectorAll('span[style]')).toHaveLength(2)
  expect(marker.querySelector('.animate-ping')).not.toBeNull()
})

test('tanpa highlightId denah tampil tanpa titik berkedip', () => {
  render(<Denah zones={seedZones} />)
  expect(screen.queryByTestId('denah-highlight')).toBeNull()
})

test('keterangan menampilkan semua nama zona', () => {
  render(<DenahLegend zones={seedZones} activeId="zone-hitam" />)
  for (const zone of seedZones) {
    expect(screen.getByText(zone.nama)).toBeInTheDocument()
  }
})

test('penyimpanan lama tanpa zones diisi seed tanpa membuang tools', async () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tools: [
        {
          id: 'tool-lama',
          nama: 'Tools Lama',
          category_id: 'cat-kunci',
          location_id: 'loc-melting-a1',
          jumlah: 1,
          qr_value: 'tool-lama',
        },
      ],
      categories: [],
      locations: [],
    }),
  )

  const repo = new MockRepository()
  expect(await repo.getZones()).toHaveLength(seedZones.length)
  expect((await repo.getTools())[0].nama).toBe('Tools Lama')
})

test('saveZone mengubah nama tapi tidak warnanya', async () => {
  const repo = new MockRepository()
  const zone = seedZones[0]
  const updated = await repo.saveZone({
    id: zone.id,
    nama: 'Lemari Tools Baru',
    x: zone.x,
    y: zone.y,
  })

  expect(updated.nama).toBe('Lemari Tools Baru')
  expect(updated.warna).toBe(zone.warna)
  expect((await new MockRepository().getZones())[0].nama).toBe('Lemari Tools Baru')
})
