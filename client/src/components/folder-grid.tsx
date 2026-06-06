import { FolderCard } from "@/components/folder-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Folder } from "@/types/folder"

type Props = {
  folders: Folder[]
  loading: boolean
  onDelete?: (id: string) => Promise<void> 
}

export function FolderGrid({ folders, loading, onDelete }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (folders.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {folders.map((folder) => (
        <FolderCard key={folder._id} folder={folder} onDelete={onDelete} />
      ))}
    </div>
  )
}