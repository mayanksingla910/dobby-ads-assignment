import { useState, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/api/images"
import { toast } from "sonner"
import { LoadingSwap } from "./loading-swap"

type Props = {
  folderId: string
  onUploaded: () => void
}

export function UploadImageDialog({ folderId, onUploaded }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    if (!name) setName(selected.name.replace(/\.[^/.]+$/, ""))
    setPreview(URL.createObjectURL(selected))
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name.trim()) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("name", name.trim())
      formData.append("folderId", folderId)
      formData.append("image", file)
      await uploadImage(formData)
      toast.success("Image uploaded")
      setName("")
      setFile(null)
      setPreview(null)
      setOpen(false)
      onUploaded()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setName("")
      setFile(null)
      setPreview(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Upload className="mr-2 size-4" />
          Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-name">Name</Label>
            <Input
              id="image-name"
              placeholder="e.g. Banner Ad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            {preview ? (
              <div className="relative aspect-video overflow-hidden rounded-lg border">
                <img
                  src={preview}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:bg-accent"
                onClick={() => inputRef.current?.click()}
              >
                <ImageIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select an image
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file || !name.trim()}>
              <LoadingSwap isLoading={loading}>Upload</LoadingSwap>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
