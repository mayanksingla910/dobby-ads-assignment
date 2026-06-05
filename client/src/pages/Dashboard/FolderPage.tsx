import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getFolderById } from "@/api/folders"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { UploadImageDialog } from "@/components/upload-image-dialog"
import { FolderGrid } from "@/components/folder-grid"
import { ImageGrid } from "@/components/image-grid"
import type { Folder, Image } from "@/types/folder"
import { useBreadcrumbStore } from "@/store/useBreadcrumbStore"
import { formatSize } from "@/lib/format"

export default function FolderPage() {
  const { id } = useParams<{ id: string }>()
  const { setItems } = useBreadcrumbStore()
  const [subfolders, setSubfolders] = useState<Folder[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContents = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await getFolderById(id)
      setSubfolders(data.subfolders)
      setImages(data.images)
      setItems(data.breadcrumb)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContents()
  }, [id])

  const isEmpty = !loading && subfolders.length === 0 && images.length === 0

  const totalSubfoldersSize = subfolders.reduce(
    (acc, folder) => acc + (folder.totalSize || 0),
    0
  ) + images.reduce((acc, image) => acc + image.size, 0)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <CreateFolderDialog parentId={id!} onCreated={fetchContents} />
          <UploadImageDialog folderId={id!} onUploaded={fetchContents} />
        </div>
      </div>

      {subfolders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Folders
          </h2>
          <FolderGrid
            folders={subfolders}
            loading={loading}
            onRefresh={fetchContents}
          />
        </section>
      )}

      {images.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Images
          </h2>
          <ImageGrid
            images={images}
            loading={loading}
            onRefresh={fetchContents}
          />
        </section>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
          <p className="text-lg font-medium">This folder is empty</p>
          <p className="text-sm text-muted-foreground">
            Create a folder or upload an image to get started
          </p>
        </div>
      )}
      <footer className="absolute bottom-0 left-6 right-6 flex items-center justify-between bg-background py-2 text-sm text-muted-foreground">
        <p>{formatSize(totalSubfoldersSize)} total</p>
        <p className="text-sm text-muted-foreground">
          {subfolders.length} folder{subfolders.length !== 1 ? "s" : ""},&nbsp;
          {images.length} image{images.length !== 1 ? "s" : ""}
        </p>
      </footer>
    </div>
  )
}
