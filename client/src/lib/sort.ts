import type { SortField, SortDirection } from "@/hooks/useSort"
import type { Folder, Image } from "@/types/folder"

type Sortable = Folder | Image

function getValue(item: Sortable, field: SortField): string | number {
  switch (field) {
    case "name":      return item.name.toLowerCase()
    case "size":      return "size" in item ? item.size : item.totalSize  
    case "createdAt": return item.createdAt
    case "updatedAt": return item.updatedAt
  }
}

export function sortItems<T extends Sortable>(
  items: T[],
  field: SortField,
  direction: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const av = getValue(a, field)
    const bv = getValue(b, field)
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return direction === "asc" ? cmp : -cmp
  })
}