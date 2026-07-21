import { Route, Routes } from 'react-router-dom'
import { DataProvider } from '@/data/DataProvider'
import { AuthProvider } from '@/auth/AuthProvider'
import Home from '@/pages/Home'
import ToolDetail from '@/pages/ToolDetail'
import Scan from '@/pages/Scan'
import Return from '@/pages/Return'
import Login from '@/pages/admin/Login'

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/:id" element={<ToolDetail />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/return/:id" element={<Return />} />
          <Route path="/admin" element={<Login />} />
        </Routes>
      </AuthProvider>
    </DataProvider>
  )
}
