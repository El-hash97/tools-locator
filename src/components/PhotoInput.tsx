import { useRef, useState, type ChangeEvent } from 'react'
import { compressImage } from '@/lib/image'

type Props = {
  label: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
}

export function PhotoInput({ label, value, onChange }: Props) {
  const [error, setError] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // reset agar pemilihan file yang sama tetap memicu onChange berikutnya
    event.target.value = ''
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
      <label className="mb-1 block text-sm font-medium">{label}</label>

      {value && (
        <img
          src={value}
          alt={label}
          className="mb-2 h-24 w-24 rounded-lg object-cover ring-1 ring-neutral-200"
        />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 text-sm font-medium text-white active:bg-black"
        >
          <span aria-hidden>📷</span> Kamera
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-sm font-medium text-neutral-700 ring-1 ring-neutral-300 active:bg-neutral-50"
        >
          <span aria-hidden>🖼️</span> Galeri
        </button>
      </div>

      {/* Input khusus kamera — capture="environment" membuka kamera belakang langsung */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={pick}
        className="hidden"
        tabIndex={-1}
      />
      {/* Input galeri — tanpa capture sehingga browser menampilkan pemilih file / galeri */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={pick}
        className="hidden"
        tabIndex={-1}
      />

      {error && <p className="mt-1 text-sm text-toyota">{error}</p>}
    </div>
  )
}
