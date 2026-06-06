// Dashboard.tsx
import { useEffect } from "react"
import { useBreadcrumbStore } from "@/store/useBreadcrumbStore"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { FolderGrid } from "@/components/folder-grid"
import { formatSize } from "@/lib/format"
import type { Folder } from "@/types/folder"
import { useRootFolders } from "@/hooks/useFolders"
import { LayoutGrid, List } from "lucide-react"
import { useViewMode } from "@/hooks/useViewMode"
import { Button } from "@/components/ui/button"
import { useSort } from "@/hooks/useSort"
import { sortItems } from "@/lib/sort"
import { SortControl } from "@/components/sort-control"
import { useSelection } from "@/hooks/useSelection"
import { SelectionBar } from "@/components/selection-bar"
import { deleteFolder } from "@/api/folders"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

export default function Dashboard() {
  const { clearItems } = useBreadcrumbStore()
  const { sort, updateSort } = useSort()
  const { view, toggle } = useViewMode()
  const { mutate } = useSWRConfig()

  const { folders, isLoading, optimisticCreate, optimisticDelete, optimisticRename } =
    useRootFolders()

  const {
    selected, isSelecting, isSelected,
    toggle: toggleItem, rangeSelect,
    selectAll, clearAll, deselectAll, count,
  } = useSelection()

  const lastSelectedId = useRef<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { clearItems() }, [])

  const isEmpty = !isLoading && folders.length === 0
  const totalFoldersSize = folders.reduce((acc: number, f: Folder) => acc + (f.totalSize || 0), 0)
  const sortedFolders = sortItems(folders, sort.field, sort.direction)
  const allItems = sortedFolders.map((f) => ({ id: f._id, type: "folder" as const }))

  const handleToggle = (id: string) => (e?: React.MouseEvent) => {
    const item = { id, type: "folder" as const }
    if (e?.shiftKey) {
      rangeSelect(allItems, lastSelectedId.current, item)
    } else {
      toggleItem(item)
    }
    lastSelectedId.current = id
  }

  const handleLongPress = (id: string) => () => {
    toggleItem({ id, type: "folder" })
    lastSelectedId.current = id
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    const folderIds = [...selected.values()].map((i) => i.id)
    try {
      await mutate(
        "folders",
        async (current: any) => {
          await Promise.all(folderIds.map(deleteFolder))
          return { folders: current.folders.filter((f: Folder) => !folderIds.includes(f._id)) }
        },
        {
          optimisticData: (current: any) => ({
            folders: current.folders.filter((f: Folder) => !folderIds.includes(f._id)),
          }),
          revalidate: false,
          rollbackOnError: true,
        }
      )
      clearAll()
      toast.success(`Deleted ${folderIds.length} folder${folderIds.length !== 1 ? "s" : ""}`)
    } catch {
      toast.error("Failed to delete some folders")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <CreateFolderDialog parentId={null} onOptimisticCreate={optimisticCreate} />
        <div className="flex items-center gap-2">
          <SortControl sort={sort} onSort={updateSort} />
          <Button variant="outline" size="icon" onClick={toggle}>
            {view === "grid" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
          </Button>
        </div>
      </div>

      <FolderGrid
        folders={sortedFolders}
        loading={isLoading}
        view={view}
        onDelete={optimisticDelete}
        onRename={optimisticRename}
        isSelecting={isSelecting}
        isSelected={isSelected}
        onToggle={(id) => handleToggle(id)}
        onLongPress={(id) => handleLongPress(id)}
      />

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
          <p className="text-lg font-medium">The Drive is empty</p>
          <p className="text-sm text-muted-foreground">Create a folder to get started</p>
        </div>
      )}

      <footer className="absolute right-6 bottom-0 left-6 flex items-center justify-between bg-background py-2 text-sm text-muted-foreground">
        <p>{formatSize(totalFoldersSize)} total</p>
        <p>{folders.length} folder{folders.length !== 1 ? "s" : ""}</p>
      </footer>

      <SelectionBar
        isSelecting={isSelecting}
        count={count}
        allCount={allItems.length}
        onDelete={handleBulkDelete}
        onSelectAll={() => selectAll(allItems)}
        onDeselectAll={deselectAll}
        onClear={clearAll}
        isDeleting={isDeleting}
      />
    </div>
  )
}