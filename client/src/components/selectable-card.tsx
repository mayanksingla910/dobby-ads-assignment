import { Checkbox } from "@/components/ui/checkbox"
import { useLongPress } from "@/hooks/useLongPress"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  isSelecting: boolean
  isSelected: boolean
  onToggle: (e?: React.MouseEvent) => void
  onLongPress: () => void
  onClick: () => void     
  children: React.ReactNode
  className?: string
}

export function SelectableCard({
  isSelecting, isSelected, onToggle, onLongPress, onClick, children, className
}: Props) {
  const longPress = useLongPress(onLongPress)

  const handleClick = (e: React.MouseEvent) => {
  if (longPress.didLongPress.current) return
  if (isSelecting) { onToggle(e); return }  
  onClick()
}

  return (
    <div
      className={cn("relative", className)}
      onClick={handleClick}
      {...longPress}
    >
      <div
        className={cn(
          "absolute left-2 top-2 z-10 transition-opacity",
          isSelecting ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => { e.stopPropagation(); onToggle() }}
      >
        <Checkbox checked={isSelected} />
      </div>

      {isSelected && (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-lg ring-2 ring-primary" />
      )}

      {children}
    </div>
  )
}