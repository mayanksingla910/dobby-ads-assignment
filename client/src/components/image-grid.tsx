// image-grid.tsx
import type { ViewMode } from "@/hooks/useViewMode"
import type { Image } from "@/types/folder"
import { ImageCard } from "./image-card"
import { Skeleton } from "./ui/skeleton"

type Props = {
  images: Image[]
  loading: boolean
  view?: ViewMode
  onRename?: (id: string, name: string) => Promise<void>
  isSelecting?: boolean
  isSelected?: (id: string) => boolean
  onToggle?: (id: string) => (e?: React.MouseEvent) => void
  onLongPress?: (id: string) => void
}

export function ImageGrid({
  images,
  loading,
  view = "grid",
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
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "flex flex-col"
        }
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className={
              view === "grid" ? "aspect-video rounded-lg" : "h-9 rounded-lg"
            }
          />
        ))}
      </div>
    )
  }

  if (images.length === 0) return null

  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : "flex flex-col divide-y rounded-lg border"
      }
    >
      {images.map((image) => (
        <ImageCard
          key={image._id}
          image={image}
          view={view}
          onRename={onRename}
          isSelecting={isSelecting}
          isSelected={isSelected?.(image._id)}
          onToggle={onToggle ? (e) => onToggle(image._id)(e) : undefined}
          onLongPress={() => onLongPress?.(image._id)}
        />
      ))}
    </div>
  )
}
