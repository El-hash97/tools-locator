import { Route, Routes } from 'react-router-dom'
import { DataProvider } from '@/data/DataProvider'
import Home from '@/pages/Home'
import ToolDetail from '@/pages/ToolDetail'
import Scan from '@/pages/Scan'
import Return from '@/pages/Return'

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/:id" element={<ToolDetail />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/return/:id" element={<Return />} />
      </Routes>
    </DataProvider>
  )
}
