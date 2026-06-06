// image-card.tsx — remove onRefresh prop, own its mutation
import { MoreVertical, Trash2, ExternalLink } from "lucide-react"
import { useParams } from "react-router-dom"
import { formatSize, formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteImage } from "@/api/images"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import type { Image } from "@/types/folder"

type Props = { image: Image }

export function ImageCard({ image }: Props) {
  const { id: folderId } = useParams()
  const { mutate } = useSWRConfig()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      // optimistically remove from folder cache
      await mutate(
        `folders/${folderId}`,
        async (current: any) => {
          await deleteImage(image._id)
          return {
            ...current,
            images: current.images.filter((img: Image) => img._id !== image._id),
          }
        },
        {
          optimisticData: (current: any) => ({
            ...current,
            images: current.images.filter((img: Image) => img._id !== image._id),
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

  return (
    <div className="group relative rounded-lg border bg-card overflow-hidden">
      <div className="aspect-video bg-muted overflow-hidden">
        <img src={image.url} alt={image.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      </div>
      <div className="p-3 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{image.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatSize(image.size)} · {formatDate(image.updatedAt)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0 opacity-0 group-hover:opacity-100">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(image.url, "_blank")}>
              <ExternalLink className="size-4 mr-2" />Open
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
              <Trash2 className="size-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}