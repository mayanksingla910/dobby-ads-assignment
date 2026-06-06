// components/rename-dialog.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSwap } from "./loading-swap"

type Props = {
  open: boolean
  currentName: string
  onOpenChange: (open: boolean) => void
  onRename: (name: string) => Promise<void>
}

export function RenameDialog({
  open,
  currentName,
  onOpenChange,
  onRename,
}: Props) {
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setName(currentName)
  }, [open, currentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === currentName) return
    try {
      setLoading(true)
      await onRename(trimmed)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-input">New name</Label>
            <Input
              id="rename-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim() || name.trim() === currentName}
            >
              <LoadingSwap isLoading={loading}>Rename</LoadingSwap>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
