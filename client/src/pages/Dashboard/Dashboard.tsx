// src/pages/Dashboard.tsx
import { useEffect, useState } from "react"
import { getRootFolders } from "@/api/folders"
import { useBreadcrumbStore } from "@/store/useBreadcrumbStore"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { FolderGrid } from "@/components/folder-grid"
import type { Folder } from "@/types/folder"
import { formatSize } from "@/lib/format"

export default function Dashboard() {
  const { clearItems } = useBreadcrumbStore()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFolders = async () => {
    try {
      const data = await getRootFolders()
      setFolders(data.folders)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    clearItems()
    fetchFolders()
  }, [])

  const isEmpty = !loading && folders.length === 0

  const totalFoldersSize = folders.reduce(
    (acc, folder) => acc + (folder.totalSize || 0),
    0
  )

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Drive</h1>
        </div>
        <CreateFolderDialog parentId={null} onCreated={fetchFolders} />
      </div>

      <FolderGrid
        folders={folders}
        loading={loading}
        onRefresh={fetchFolders}
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
        <p className="text-sm text-muted-foreground">
          {folders.length} folder{folders.length !== 1 ? "s" : ""}
        </p>
      </footer>
    </div>
  )
}
