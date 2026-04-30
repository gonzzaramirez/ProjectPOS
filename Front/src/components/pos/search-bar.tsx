"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
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
          "w-full h-11 pl-9 pr-8 rounded-full text-[13px]",
          "app-surface-dark app-text-inverse placeholder:app-text-muted-inverse border",
          "focus:outline-none focus:border-accent",
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
          className="app-text-muted-inverse absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}
