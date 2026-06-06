import { useState, useCallback } from "react"

export type SelectionItem = { id: string; type: "folder" | "image" }

export function useSelection() {
  const [selected, setSelected] = useState<Map<string, SelectionItem>>(
    new Map()
  )
  const [isSelecting, setIsSelecting] = useState(false)

  const select = useCallback((item: SelectionItem) => {
    setSelected((prev) => new Map(prev).set(item.id, item))
    setIsSelecting(true)
  }, [])

  const deselect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Map(prev)
      next.delete(id)
      if (next.size === 0) setIsSelecting(false)
      return next
    })
  }, [])

  const toggle = useCallback((item: SelectionItem) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
        if (next.size === 0) setIsSelecting(false)
      } else {
        next.set(item.id, item)
        setIsSelecting(true)
      }
      return next
    })
  }, [])

  const rangeSelect = useCallback(
    (
      allIds: SelectionItem[],
      lastId: string | null,
      newItem: SelectionItem
    ) => {
      if (!lastId) {
        select(newItem)
        return
      }

      const ids = allIds.map((i) => i.id)
      const from = ids.indexOf(lastId)
      const to = ids.indexOf(newItem.id)
      if (from === -1 || to === -1) {
        select(newItem)
        return
      }

      const [start, end] = from < to ? [from, to] : [to, from]
      setSelected((prev) => {
        const next = new Map(prev)
        allIds.slice(start, end + 1).forEach((item) => next.set(item.id, item))
        setIsSelecting(true)
        return next
      })
    },
    [select]
  )

  const selectAll = useCallback((items: SelectionItem[]) => {
    setSelected(new Map(items.map((i) => [i.id, i])))
    setIsSelecting(true)
  }, [])

  const clearAll = useCallback(() => {
    setSelected(new Map())
    setIsSelecting(false)
  }, [])

  const deselectAll = useCallback(() => {
  setSelected(new Map())
}, [])

  const isSelected = useCallback((id: string) => selected.has(id), [selected])

  return {
    selected,
    isSelecting,
    select,
    deselect,
    toggle,
    rangeSelect,
    selectAll,
    clearAll,
    isSelected,
    deselectAll,
    count: selected.size,
  }
}
