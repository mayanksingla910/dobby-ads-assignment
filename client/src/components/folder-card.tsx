// folder-card.tsx
import { Folder, MoreVertical, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { formatSize, formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Folder as FolderType } from "@/types/folder"
import { useRootFolders, useAllFolders } from "@/hooks/useFolders"

type Props = { folder: FolderType; onDelete?: (id: string) => Promise<void> }

export function FolderCard({ folder, onDelete }: Props) {
  const navigate = useNavigate()
  const { optimisticDelete: deleteFromRoot } = useRootFolders()
  const { optimisticDelete: deleteFromAll } = useAllFolders()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (onDelete) {
        await onDelete(folder._id)
      } else {
        await Promise.all([
          deleteFromRoot(folder._id),
          deleteFromAll(folder._id),
        ])
      }
      toast.success("Folder deleted")
    } catch {
      toast.error("Failed to delete folder")
    }
  }

  return (
    <div
      className="group relative flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
      onClick={() => navigate(`/folder/${folder._id}`)}
    >
      <Folder className="size-8 shrink-0 text-blue-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{folder.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(folder.totalSize)} · {formatDate(folder.updatedAt)}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
