import { useState } from "react"

export type SortField = "name" | "size" | "createdAt" | "updatedAt"
export type SortDirection = "asc" | "desc"

export type SortState = {
  field: SortField
  direction: SortDirection
}

const DEFAULT: SortState = { field: "name", direction: "asc" }

export function useSort(key = "sort-prefs") {
  const [sort, setSort] = useState<SortState>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(key) ?? "") ?? DEFAULT
    } catch {
      return DEFAULT
    }
  })

  function updateSort(field: SortField, direction: SortDirection) {
    const next = { field, direction }
    sessionStorage.setItem(key, JSON.stringify(next))
    setSort(next)
  }

  return { sort, updateSort }
}