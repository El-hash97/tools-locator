import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Category, Location, Tool } from './types'
import type { ToolRepository } from './repository'
import { MockRepository } from './mockRepository'

export type DataState = {
  tools: Tool[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  repo: ToolRepository
}

const DataContext = createContext<DataState | null>(null)

// Satu-satunya tempat implementasi repository dipilih. Saat Supabase masuk,
// hanya baris ini yang berubah.
const repository: ToolRepository = new MockRepository()

export function DataProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, c, l] = await Promise.all([
        repository.getTools(),
        repository.getCategories(),
        repository.getLocations(),
      ])
      setTools(t)
      setCategories(c)
      setLocations(l)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<DataState>(
    () => ({
      tools,
      categories,
      locations,
      loading,
      error,
      refresh,
      repo: repository,
    }),
    [tools, categories, locations, loading, error, refresh],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataState {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData harus dipakai di dalam <DataProvider>')
  return context
}
