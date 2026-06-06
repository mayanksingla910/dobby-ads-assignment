import { useState } from "react"

export type ViewMode = "grid" | "list"

export function useViewMode(key = "view-mode") {
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem(key) as ViewMode) ?? "grid"
  )

  function toggle() {
    setView((current) => {
      const next = current === "grid" ? "list" : "grid"
      localStorage.setItem(key, next)
      return next
    })
  }

  return { view, toggle }
}
