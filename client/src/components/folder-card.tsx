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
import { deleteFolder } from "@/api/folders"
import { toast } from "sonner"
import type { Folder as FolderType } from "@/types/folder"

type Props = {
  folder: FolderType
  onRefresh: () => void
}

export function FolderCard({ folder, onRefresh }: Props) {
  const navigate = useNavigate()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteFolder(folder._id)
      toast.success("Folder deleted")
      onRefresh()
    } catch {
      toast.error("Failed to delete folder")
    }
  }

  return (
    <div
      className="group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
      onClick={() => navigate(`/folder/${folder._id}`)}
    >
      <Folder className="size-8 text-blue-400 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{folder.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(folder.totalSize)} · {formatDate(folder.updatedAt)}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 group-hover:opacity-100 shrink-0"
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
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}