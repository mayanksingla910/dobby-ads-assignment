import { useEffect } from "react"
import { useBreadcrumbStore } from "@/store/useBreadcrumbStore"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { FolderGrid } from "@/components/folder-grid"
import { formatSize } from "@/lib/format"
import type { Folder } from "@/types/folder"
import { useRootFolders } from "@/hooks/useFolders"

export default function Dashboard() {
  const { clearItems } = useBreadcrumbStore()

  const { folders, isLoading, optimisticCreate, optimisticDelete } =
    useRootFolders()

  useEffect(() => {
    clearItems()
  }, [])

  const isEmpty = !isLoading && folders.length === 0

  const totalFoldersSize = folders.reduce(
    (acc: number, folder: Folder) => acc + (folder.totalSize || 0),
    0
  )

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Drive</h1>
        <CreateFolderDialog
          parentId={null}
          onOptimisticCreate={optimisticCreate}
        />
      </div>
      <FolderGrid
        folders={folders}
        loading={isLoading}
        onDelete={optimisticDelete}
      />

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
          <p className="text-lg font-medium">The Drive is empty</p>
          <p className="text-sm text-muted-foreground">
            Create a folder to get started
          </p>
        </div>
      )}

      <footer className="absolute right-6 bottom-0 left-6 flex items-center justify-between bg-background py-2 text-sm text-muted-foreground">
        <p>{formatSize(totalFoldersSize)} total</p>
        <p>
          {folders.length} folder{folders.length !== 1 ? "s" : ""}
        </p>
      </footer>
    </div>
  )
}
