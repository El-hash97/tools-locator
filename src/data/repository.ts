import type {
  Category,
  CategoryInput,
  Location,
  LocationInput,
  Tool,
  ToolInput,
  Zone,
  ZoneInput,
} from './types'

export interface ToolRepository {
  getTools(): Promise<Tool[]>
  getTool(id: string): Promise<Tool | null>
  saveTool(input: ToolInput): Promise<Tool>
  deleteTool(id: string): Promise<void>

  getCategories(): Promise<Category[]>
  saveCategory(input: CategoryInput): Promise<Category>
  deleteCategory(id: string): Promise<void>

  getLocations(): Promise<Location[]>
  saveLocation(input: LocationInput): Promise<Location>
  deleteLocation(id: string): Promise<void>

  // Zone hanya bisa diubah namanya/posisinya — titiknya sudah ada di denah.
  getZones(): Promise<Zone[]>
  saveZone(input: ZoneInput): Promise<Zone>
}
