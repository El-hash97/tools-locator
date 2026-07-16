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
