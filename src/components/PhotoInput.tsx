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
        // file:h-11 = 44px: batas minimal target sentuh untuk tombol "pilih
        // berkas" yang dirender browser dari pseudo-elemen ::file-selector.
        className="block w-full text-sm text-neutral-600 file:mr-3 file:h-11 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:font-medium"
      />

      {error && <p className="mt-1 text-sm text-toyota">{error}</p>}
    </div>
  )
}
