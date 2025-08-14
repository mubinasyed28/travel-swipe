"use client"

import { useState, useMemo } from "react"
import { Search, X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface MultiSearchSelectProps {
  options: string[]
  selectedItems: string[]
  onItemsChange: (items: string[]) => void
  placeholder?: string
  allowCustom?: boolean
  label?: string
}

export function MultiSearchSelect({
  options,
  selectedItems,
  onItemsChange,
  placeholder = "Search or add items...",
  allowCustom = false,
  label,
}: MultiSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options.slice(0, 10) // Show first 10 by default

    return options.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10) // Limit to 10 results when searching
  }, [searchTerm, options])

  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      onItemsChange(selectedItems.filter((i) => i !== item))
    } else {
      onItemsChange([...selectedItems, item])
    }
  }

  const removeItem = (item: string) => {
    onItemsChange(selectedItems.filter((i) => i !== item))
  }

  const addCustomItem = () => {
    const trimmedSearchTerm = searchTerm.trim()
    if (trimmedSearchTerm && !selectedItems.includes(trimmedSearchTerm)) {
      onItemsChange([...selectedItems, trimmedSearchTerm])
      setSearchTerm("")
      setIsOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge key={item} variant="default" className="flex items-center gap-1 pr-1">
              {item}
              <button onClick={() => removeItem(item)} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
            <ScrollArea className="max-h-60">
              <div className="p-2">
                {filteredOptions.length > 0 ? (
                  <div className="space-y-1">
                    {filteredOptions.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          toggleItem(item)
                          setSearchTerm("")
                          setIsOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                          selectedItems.includes(item) ? "bg-blue-50 text-blue-700" : ""
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No items found matching "{searchTerm}"
                    {allowCustom && searchTerm.trim() && (
                      <Button variant="ghost" size="sm" onClick={addCustomItem} className="w-full justify-start mt-2">
                        <Plus size={16} className="mr-2" /> Add "{searchTerm}"
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Backdrop to close dropdown */}
          <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}
