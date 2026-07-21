import { Route, Routes } from 'react-router-dom'
import { DataProvider } from '@/data/DataProvider'
import Home from '@/pages/Home'
import ToolDetail from '@/pages/ToolDetail'
import Return from '@/pages/Return'

function Placeholder({ nama }: { nama: string }) {
  return <p className="p-6">{nama}</p>
}

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/:id" element={<ToolDetail />} />
        <Route path="/scan" element={<Placeholder nama="Scan" />} />
        <Route path="/return/:id" element={<Return />} />
      </Routes>
    </DataProvider>
  )
}
