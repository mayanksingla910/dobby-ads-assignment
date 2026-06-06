import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SortField, SortDirection, SortState } from "@/hooks/useSort"

const FIELDS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
  { value: "updatedAt", label: "Modified" },
  { value: "createdAt", label: "Created" },
]

type Props = {
  sort: SortState
  onSort: (field: SortField, direction: SortDirection) => void
}

export function SortControl({ sort, onSort }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={sort.field}
        onValueChange={(field) => onSort(field as SortField, sort.direction)}
      >
        <SelectTrigger className="h-16 w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FIELDS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() =>
          onSort(sort.field, sort.direction === "asc" ? "desc" : "asc")
        }
        aria-label={`Sort ${sort.direction === "asc" ? "descending" : "ascending"}`}
      >
        <ArrowUpDown
          className={`size-4 transition-transform ${sort.direction === "desc" ? "rotate-180" : ""}`}
        />
      </Button>
    </div>
  )
}
