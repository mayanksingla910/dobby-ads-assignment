import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { UploadImageDialog } from "@/components/upload-image-dialog"
import { FolderGrid } from "@/components/folder-grid"
import { ImageGrid } from "@/components/image-grid"
import { useBreadcrumbStore } from "@/store/useBreadcrumbStore"
import { formatSize } from "@/lib/format"
import type { Folder, Image } from "@/types/folder"
import { useFolder } from "@/hooks/useFolders"

export default function FolderPage() {
  const { id } = useParams<{ id: string }>()
  const { setItems } = useBreadcrumbStore()

  const { subfolders, images, breadcrumb, isLoading, mutate, optimisticCreateSubfolder, optimisticDeleteSubfolder } = useFolder(id)

  useEffect(() => {
    if (breadcrumb) setItems(breadcrumb)
  }, [breadcrumb, setItems])

  const isEmpty = !isLoading && subfolders.length === 0 && images.length === 0

  const totalSize =
    subfolders.reduce((acc: number, f: Folder) => acc + (f.totalSize || 0), 0) +
    images.reduce((acc: number, img: Image) => acc + img.size, 0)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <CreateFolderDialog parentId={id!} onOptimisticCreate={optimisticCreateSubfolder}/>
          <UploadImageDialog folderId={id!} onUploaded={() => mutate()} />
        </div>
      </div>

      {subfolders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Folders
          </h2>
          <FolderGrid folders={subfolders} loading={isLoading} onDelete={optimisticDeleteSubfolder} />
        </section>
      )}

      {images.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Images
          </h2>
          <ImageGrid images={images} loading={isLoading} />
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

      <footer className="absolute right-6 bottom-0 left-6 flex items-center justify-between bg-background py-2 text-sm text-muted-foreground">
        <p>{formatSize(totalSize)} total</p>
        <p>
          {subfolders.length} folder{subfolders.length !== 1 ? "s" : ""},&nbsp;
          {images.length} image{images.length !== 1 ? "s" : ""}
        </p>
      </footer>
    </div>
  )
}
