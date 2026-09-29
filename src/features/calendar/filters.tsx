import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { STATUS_LABEL, type ExpoStatus } from "@/data/types"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FilterState {
  query: string
  sectors: string[]
  state: string // "all" or a state name
  status: ExpoStatus | "all"
}

export const EMPTY_FILTERS: FilterState = {
  query: "",
  sectors: [],
  state: "all",
  status: "all",
}

export function isFiltered(f: FilterState) {
  return f.query !== "" || f.sectors.length > 0 || f.state !== "all" || f.status !== "all"
}

export function Filters({
  value,
  onChange,
  sectorCounts,
  states,
  statuses,
}: {
  value: FilterState
  onChange: (f: FilterState) => void
  sectorCounts: [string, number][]
  states: string[]
  statuses: ExpoStatus[]
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch })
  const toggleSector = (s: string) =>
    set({
      sectors: value.sectors.includes(s)
        ? value.sectors.filter((x) => x !== s)
        : [...value.sectors, s],
    })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Search exhibition, organiser, city"
          className="pl-7"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-dashed">
            Sector
            {value.sectors.length > 0 && (
              <span className="rounded-sm bg-secondary px-1 tabular-nums">
                {value.sectors.length}
              </span>
            )}
            <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Find a sector" />
            <CommandList>
              <CommandEmpty>No sector found</CommandEmpty>
              <CommandGroup>
                {sectorCounts.map(([s, n]) => {
                  const on = value.sectors.includes(s)
                  return (
                    <CommandItem key={s} value={s} onSelect={() => toggleSector(s)}>
                      <span
                        className={cn(
                          "flex size-3.5 items-center justify-center rounded-[4px] border",
                          on && "border-primary bg-primary text-primary-foreground"
                        )}
                      >
                        {on && <CheckIcon className="size-2.5" />}
                      </span>
                      <span className="flex-1 truncate">{s}</span>
                      <span className="text-muted-foreground tabular-nums">{n}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
            {value.sectors.length > 0 && (
              <div className="border-t p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => set({ sectors: [] })}
                >
                  Clear sectors
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      <Select value={value.state} onValueChange={(v) => set({ state: v })}>
        <SelectTrigger className="min-w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All states</SelectItem>
          {states.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.status}
        onValueChange={(v) => set({ status: v as FilterState["status"] })}
      >
        <SelectTrigger className="min-w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any date status</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered(value) && (
        <Button variant="ghost" onClick={() => onChange(EMPTY_FILTERS)}>
          Reset
          <XIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}
