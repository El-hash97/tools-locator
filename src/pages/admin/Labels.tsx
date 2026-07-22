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
          className="flex h-11 items-center gap-2 rounded-xl bg-toyota px-4 text-sm font-semibold text-white active:bg-toyota-dark"
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
