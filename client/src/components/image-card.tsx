import { MoreVertical, Trash2, ExternalLink, Pencil } from "lucide-react"
import { useParams } from "react-router-dom"
import { formatSize, formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteImage } from "@/api/images"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import type { Image } from "@/types/folder"
import type { ViewMode } from "@/hooks/useViewMode"
import { useState } from "react"
import { RenameDialog } from "./rename-dialog"
import { renameImage } from "@/api/images"
import { SelectableCard } from "./selectable-card"

type Props = {
  image: Image
  view?: ViewMode
  onRename?: (id: string, name: string) => Promise<void>
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (e?: React.MouseEvent) => void
  onLongPress?: () => void
}

export function ImageCard({
  image,
  view = "grid",
  onRename,
  isSelecting = false,
  isSelected = false,
  onToggle = () => {},
  onLongPress = () => {},
}: Props) {
  const { id: folderId } = useParams()
  const { mutate } = useSWRConfig()
  const [renameOpen, setRenameOpen] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await mutate(
        `folders/${folderId}`,
        async (current: any) => {
          await deleteImage(image._id)
          return {
            ...current,
            images: current.images.filter(
              (img: Image) => img._id !== image._id
            ),
          }
        },
        {
          optimisticData: (current: any) => ({
            ...current,
            images: current.images.filter(
              (img: Image) => img._id !== image._id
            ),
          }),
          revalidate: false,
          rollbackOnError: true,
        }
      )
      toast.success("Image deleted")
    } catch {
      toast.error("Failed to delete image")
    }
  }

  const handleRename = async (name: string) => {
    try {
      if (onRename) {
        await onRename(image._id, name)
      } else {
        await mutate(
          `folders/${folderId}`,
          async (current: any) => {
            await renameImage(image._id, name)
            return {
              ...current,
              images: current.images.map((img: Image) =>
                img._id === image._id ? { ...img, name } : img
              ),
            }
          },
          {
            optimisticData: (current: any) => ({
              ...current,
              images: current.images.map((img: Image) =>
                img._id === image._id ? { ...img, name } : img
              ),
            }),
            revalidate: false,
            rollbackOnError: true,
          }
        )
      }
      toast.success("Image renamed")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to rename image")
    }
  }

  const actions = (
    <>
      <RenameDialog
        open={renameOpen}
        currentName={image.name}
        onOpenChange={setRenameOpen}
        onRename={handleRename}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil className="mr-2 size-4" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(image.url, "_blank")}>
            <ExternalLink className="mr-2 size-4" /> Open
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
        id={image._id}
        isSelecting={isSelecting}
        isSelected={isSelected}
        onToggle={onToggle}
        onLongPress={onLongPress}
        onClick={() => {}}
        className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
      >
        <div className="size-8 shrink-0 overflow-hidden rounded">
          <img
            src={image.url}
            alt={image.name}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {image.name}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatSize(image.size)}
        </span>
        <span className="w-32 shrink-0 text-right text-xs text-muted-foreground">
          {formatDate(image.updatedAt)}
        </span>
        {actions}
      </SelectableCard>
    )
  }

  return (
    <SelectableCard
      id={image._id}
      isSelecting={isSelecting}
      isSelected={isSelected}
      onToggle={onToggle}
      onLongPress={onLongPress}
      onClick={() => {}}
      className="group relative overflow-hidden rounded-lg border bg-card"
    >
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={image.url}
          alt={image.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{image.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatSize(image.size)} · {formatDate(image.updatedAt)}
          </p>
        </div>
        {actions}
      </div>
    </SelectableCard>
  )
}
