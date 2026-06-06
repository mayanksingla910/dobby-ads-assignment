// create-folder-dialog.tsx
import { useState } from "react"
import { FolderPlus } from "lucide-react"
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
import { toast } from "sonner"
import { LoadingSwap } from "./loading-swap"
import { useAllFolders } from "@/hooks/useFolders"

type Props = {
  parentId: string | null
  onOptimisticCreate?: (name: string) => Promise<void>
}

export function CreateFolderDialog({ parentId, onOptimisticCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const { optimisticCreate } = useAllFolders()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      setLoading(true)
      await (onOptimisticCreate ?? optimisticCreate)(
        name.trim(),
        parentId ?? undefined
      )
      toast.success("Folder created")
      setName("")
      setOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create folder")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <FolderPlus className="mr-2 size-4" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="e.g. Campaigns"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
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
            <Button type="submit" disabled={loading || !name.trim()}>
              <LoadingSwap isLoading={loading}>Create</LoadingSwap>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
