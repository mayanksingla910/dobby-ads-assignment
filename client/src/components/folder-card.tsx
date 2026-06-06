import { Folder, MoreVertical, Trash2, Pencil } from "lucide-react"
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
import type { ViewMode } from "@/hooks/useViewMode"
import { useState } from "react"
import { RenameDialog } from "./rename-dialog"
import { SelectableCard } from "./selectable-card"

type Props = {
  folder: FolderType
  view?: ViewMode
  onDelete?: (id: string) => Promise<void>
  onRename?: (id: string, name: string) => Promise<void>
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (e?: React.MouseEvent) => void
  onLongPress?: () => void
  lastSelectedId?: string | null
}

export function FolderCard({
  folder,
  view = "grid",
  onDelete,
  onRename,
  isSelecting = false,
  isSelected = false,
  onToggle = () => {},
  onLongPress = () => {},
}: Props) {
  const navigate = useNavigate()
  const [renameOpen, setRenameOpen] = useState(false)
  const { optimisticDelete: deleteFromRoot } = useRootFolders()
  const { optimisticDelete: deleteFromAll, optimisticRename: renameInAll } =
    useAllFolders()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await (onDelete
        ? onDelete(folder._id)
        : Promise.all([deleteFromRoot(folder._id), deleteFromAll(folder._id)]))
      toast.success("Folder deleted")
    } catch {
      toast.error("Failed to delete folder")
    }
  }

  const handleRename = async (name: string) => {
    try {
      await (onRename
        ? onRename(folder._id, name)
        : renameInAll(folder._id, name))
      toast.success("Folder renamed")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to rename folder")
    }
  }

  const actions = (
    <>
      <RenameDialog
        open={renameOpen}
        currentName={folder.name}
        onOpenChange={setRenameOpen}
        onRename={handleRename}
      />
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
            onClick={(e) => {
              e.stopPropagation()
              setRenameOpen(true)
            }}
          >
            <Pencil className="mr-2 size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  if (view === "list") {
    return (
      <SelectableCard
        id={folder._id}
        isSelecting={isSelecting}
        isSelected={isSelected}
        onToggle={onToggle}
        onLongPress={onLongPress}
        onClick={() => navigate(`/folder/${folder._id}`)}
        className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
      >
        <Folder className="size-4 shrink-0 text-blue-400 group-hover:text-blue-400/60" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {folder.name}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatSize(folder.totalSize)}
        </span>
        <span className="w-32 shrink-0 text-right text-xs text-muted-foreground">
          {formatDate(folder.updatedAt)}
        </span>
        {actions}
      </SelectableCard>
    )
  }

  return (
    <SelectableCard
      id={folder._id}
      isSelecting={isSelecting}
      isSelected={isSelected}
      onToggle={onToggle}
      onLongPress={onLongPress}
      onClick={() => navigate(`/folder/${folder._id}`)}
      className="group relative flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
    >
      <Folder className="size-8 shrink-0 text-blue-400 group-hover:text-blue-400/60" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{folder.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(folder.totalSize)} · {formatDate(folder.updatedAt)}
        </p>
      </div>
      {actions}
    </SelectableCard>
  )
}
