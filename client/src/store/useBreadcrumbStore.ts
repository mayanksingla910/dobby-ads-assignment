
import { create } from "zustand"

type BreadcrumbItem = {
  id?: string
  name: string
}

type BreadcrumbStore = {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
  clearItems: () => void
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  clearItems: () => set({ items: [] }),
}))