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
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 active:bg-neutral-200"
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
