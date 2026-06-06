import { Trash2, X, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "./loading-swap"

type Props = {
  count: number
  allCount: number
  onDelete: () => void
  onSelectAll: () => void
  onClear: () => void
  onDeselectAll: () => void
  isDeleting: boolean
  isSelecting: boolean
}

export function SelectionBar({
  count,
  allCount,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onClear,
  isDeleting,
  isSelecting,
}: Props) {
  if (!isSelecting) return null
  return (
    <div className="fixed bottom-16 w-88 sm:bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center gap-3 rounded-full border bg-background px-4 py-2 shadow-lg">
      <button onClick={onClear} className="rounded-full p-1 hover:bg-accent">
        <X className="size-4" />
      </button>
      <span className="text-sm font-medium">{count} selected</span>
      <div className="h-4 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        onClick={count === allCount ? onDeselectAll : onSelectAll}
        className="gap-2"
      >
        <CheckSquare className="size-4" />
        {count === allCount ? "Deselect all" : "Select all"}
      </Button>
      <div className="h-4 w-px bg-border" />
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isDeleting}
        className="gap-2"
      >
        <Trash2 className="size-4" />
        <LoadingSwap isLoading={isDeleting}>Delete</LoadingSwap>
      </Button>
    </div>
  )
}
