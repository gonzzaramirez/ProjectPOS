"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef } from "react"

type SearchBarProps = {
  value: string
  onChange: (val: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative w-full min-w-0">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-9 pl-8 pr-8 rounded-xl text-[13px]",
          "bg-muted/50 border border-transparent",
          "text-foreground placeholder:text-muted-foreground/50",
          "focus:outline-none focus:border-border focus:bg-muted/70",
          "transition-colors duration-150"
        )}
        aria-label="Buscar productos"
      />
      {value && (
        <button
          onClick={() => {
            onChange("")
            inputRef.current?.focus()
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}
