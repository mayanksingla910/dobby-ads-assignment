import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { UploadImageDialog } from "@/components/upload-image-dialog"
import { FolderGrid } from "@/components/folder-grid"
import { ImageGrid } from "@/components/image-grid"
import { useBreadcrumbStore } from "@/store/useBreadcrumbStore"
import { formatSize } from "@/lib/format"
import type { Folder, Image } from "@/types/folder"
import { useFolder } from "@/hooks/useFolders"
import { useViewMode } from "@/hooks/useViewMode"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSort } from "@/hooks/useSort"
import { sortItems } from "@/lib/sort"
import { SortControl } from "@/components/sort-control"
import { useSelection } from "@/hooks/useSelection"
import { SelectionBar } from "@/components/selection-bar"
import { deleteFolder } from "@/api/folders"
import { deleteImage } from "@/api/images"
import { useState, useRef } from "react"
import { toast } from "sonner"

export default function FolderPage() {
  const { id } = useParams<{ id: string }>()
  const { setItems } = useBreadcrumbStore()
  const {
    subfolders,
    images,
    breadcrumb,
    isLoading,
    mutate,
    optimisticCreateSubfolder,
    optimisticDeleteSubfolder,
    optimisticRenameSubfolder,
    optimisticRenameImage,
  } = useFolder(id!)

  const { sort, updateSort } = useSort()
  const { view, toggle } = useViewMode()
  const {
    selected,
    isSelecting,
    isSelected,
    toggle: toggleItem,
    rangeSelect,
    selectAll,
    clearAll,
    count,
    deselectAll,
  } = useSelection()

  const lastSelectedId = useRef<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (breadcrumb) setItems(breadcrumb)
  }, [breadcrumb, setItems])

  const isEmpty = !isLoading && subfolders.length === 0 && images.length === 0

  const totalSize =
    subfolders.reduce((acc: number, f: Folder) => acc + (f.totalSize || 0), 0) +
    images.reduce((acc: number, img: Image) => acc + img.size, 0)

  const sortedFolders = sortItems(subfolders, sort.field, sort.direction)
  const sortedImages = sortItems(images, sort.field, sort.direction)

  const allItems = [
    ...sortedFolders.map((f) => ({ id: f._id, type: "folder" as const })),
    ...sortedImages.map((img) => ({ id: img._id, type: "image" as const })),
  ]

  const handleToggle =
    (id: string, type: "folder" | "image") => (e?: React.MouseEvent) => {
      const item = { id, type }
      if (e?.shiftKey) {
        rangeSelect(allItems, lastSelectedId.current, item)
      } else {
        toggleItem(item)
      }
      lastSelectedId.current = id
    }

  const handleLongPress = (id: string, type: "folder" | "image") => () => {
    toggleItem({ id, type })
    lastSelectedId.current = id
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      const folderIds = [...selected.values()]
        .filter((i) => i.type === "folder")
        .map((i) => i.id)
      const imageIds = [...selected.values()]
        .filter((i) => i.type === "image")
        .map((i) => i.id)

      await mutate(
        async (current: any) => {
          await Promise.all([
            ...folderIds.map(deleteFolder),
            ...imageIds.map(deleteImage),
          ])
          return {
            ...current,
            subfolders: current.subfolders.filter(
              (f: Folder) => !folderIds.includes(f._id)
            ),
            images: current.images.filter(
              (img: Image) => !imageIds.includes(img._id)
            ),
          }
        },
        {
          optimisticData: (current: any) => ({
            ...current,
            subfolders: current.subfolders.filter(
              (f: Folder) => !folderIds.includes(f._id)
            ),
            images: current.images.filter(
              (img: Image) => !imageIds.includes(img._id)
            ),
          }),
          revalidate: false,
          rollbackOnError: true,
        }
      )
      clearAll()
      toast.success(
        `Deleted ${selected.size} item${selected.size !== 1 ? "s" : ""}`
      )
    } catch {
      toast.error("Failed to delete some items")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <CreateFolderDialog
            parentId={id!}
            onOptimisticCreate={optimisticCreateSubfolder}
          />
          <UploadImageDialog folderId={id!} onUploaded={() => mutate()} />
        </div>
        <div className="flex items-center gap-2">
          <SortControl sort={sort} onSort={updateSort} />
          <Button variant="outline" size="icon" onClick={toggle}>
            {view === "grid" ? (
              <List className="size-4" />
            ) : (
              <LayoutGrid className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {sortedFolders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Folders
          </h2>
          <FolderGrid
            folders={sortedFolders}
            loading={isLoading}
            view={view}
            onDelete={optimisticDeleteSubfolder}
            onRename={optimisticRenameSubfolder}
            isSelecting={isSelecting}
            isSelected={isSelected}
            onToggle={(id) => handleToggle(id, "folder")}
            onLongPress={(id) => handleLongPress(id, "folder")()}
          />
        </section>
      )}

      {sortedImages.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Images
          </h2>
          <ImageGrid
            images={sortedImages}
            loading={isLoading}
            view={view}
            onRename={optimisticRenameImage}
            isSelecting={isSelecting}
            isSelected={isSelected}
            onToggle={(id) => handleToggle(id, "image")}
            onLongPress={(id) => handleLongPress(id, "image")()}
          />
        </section>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
          <p className="text-lg font-medium">This folder is empty</p>
          <p className="text-sm text-muted-foreground">
            Create a folder or upload an image to get started
          </p>
        </div>
      )}

      <footer className="absolute right-6 bottom-0 left-6 flex items-center justify-between bg-background py-2 text-sm text-muted-foreground">
        <p>{formatSize(totalSize)} total</p>
        <p>
          {subfolders.length} folder{subfolders.length !== 1 ? "s" : ""},&nbsp;
          {images.length} image{images.length !== 1 ? "s" : ""}
        </p>
      </footer>
      <SelectionBar
        count={count}
        allCount={allItems.length}
        onDelete={handleBulkDelete}
        onSelectAll={() => selectAll(allItems)}
        onDeselectAll={deselectAll}
        onClear={clearAll}
        isSelecting={isSelecting}
        isDeleting={isDeleting}
      />
    </div>
  )
}
