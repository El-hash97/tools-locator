import { Route, Routes } from 'react-router-dom'
import { DataProvider } from '@/data/DataProvider'
import { AuthProvider } from '@/auth/AuthProvider'
import { RequireAuth } from '@/auth/RequireAuth'
import Home from '@/pages/Home'
import ToolDetail from '@/pages/ToolDetail'
import Scan from '@/pages/Scan'
import Return from '@/pages/Return'
import Login from '@/pages/admin/Login'
import AdminTools from '@/pages/admin/Tools'
import AdminCategories from '@/pages/admin/Categories'
import AdminLocations from '@/pages/admin/Locations'

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
          <Route
            path="/admin/tools"
            element={
              <RequireAuth>
                <AdminTools />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequireAuth>
                <AdminCategories />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/locations"
            element={
              <RequireAuth>
                <AdminLocations />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </DataProvider>
  )
}
