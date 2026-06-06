import type { ViewMode } from "@/hooks/useViewMode"
import { FolderCard } from "./folder-card"
import { Skeleton } from "./ui/skeleton"
import type { Folder } from "@/types/folder"

type Props = {
  folders: Folder[]
  loading: boolean
  view?: ViewMode
  onDelete?: (id: string) => Promise<void>
  onRename?: (id: string, name: string) => Promise<void>
  isSelecting?: boolean
  isSelected?: (id: string) => boolean
  onToggle?: (id: string) => (e?: React.MouseEvent) => void 
  onLongPress?: (id: string) => void
}

export function FolderGrid({
  folders,
  loading,
  view = "grid",
  onDelete,
  onRename,
  isSelecting,
  isSelected,
  onToggle,
  onLongPress,
}: Props) {
  if (loading) {
    return (
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "flex flex-col"
        }
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className={view === "grid" ? "h-16 rounded-lg" : "h-9 rounded-lg"}
          />
        ))}
      </div>
    )
  }

  if (folders.length === 0) return null

  return (
    <div className={view === "grid"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "flex flex-col divide-y rounded-lg border"
    }>
      {folders.map((folder) => (
        <FolderCard
          key={folder._id}
          folder={folder}
          view={view}
          onDelete={onDelete}
          onRename={onRename}
          isSelecting={isSelecting}
          isSelected={isSelected?.(folder._id)}
          onToggle={onToggle ? (e) => onToggle(folder._id)(e) : undefined}
          onLongPress={() => onLongPress?.(folder._id)}
        />
      ))}
    </div>
  )
}
