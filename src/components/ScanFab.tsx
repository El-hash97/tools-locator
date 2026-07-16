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
