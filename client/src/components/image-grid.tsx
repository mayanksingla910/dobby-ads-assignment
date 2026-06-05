import { ImageCard } from "@/components/image-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Image } from "@/types/folder"

type Props = {
  images: Image[]
  loading: boolean
  onRefresh: () => void
}

export function ImageGrid({ images, loading, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-video rounded-lg" />
        ))}
      </div>
    )
  }

  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {images.map((image) => (
        <ImageCard key={image._id} image={image} onRefresh={onRefresh} />
      ))}
    </div>
  )
}