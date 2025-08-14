"use client"

import { useState, useMemo } from "react"
import { Search, X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const ALL_CATEGORIES = [
  "Cultural",
  "Historic",
  "Beach",
  "Urban",
  "Foodie",
  "Adventure",
  "Shopping",
  "Scenic",
  "Nature",
  "Wildlife",
  "Architecture",
  "Art",
  "Museums",
  "Nightlife",
  "Family",
  "Relaxation",
  "Spiritual",
  "Sports",
  "Music",
  "Festivals",
  "Educational",
  "Eco-tourism",
  "Wellness",
  "Photography",
  "Hiking",
  "Water Sports",
  "Street Art",
  "Local Markets",
  "Historical Sites",
  "Modern",
  "Traditional",
  "Offbeat",
  "Luxury",
  "Budget-Friendly",
  "Romantic",
  "Solo Travel",
  "Group Travel",
]

interface CategorySearchProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  placeholder?: string
}

export function CategorySearch({
  selectedCategories,
  onCategoriesChange,
  placeholder = "Search or add categories...",
}: CategorySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return ALL_CATEGORIES.slice(0, 10) // Show first 10 by default

    return ALL_CATEGORIES.filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10) // Limit to 10 results when searching
  }, [searchTerm])

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category))
    } else {
      onCategoriesChange([...selectedCategories, category])
    }
  }

  const removeCategory = (category: string) => {
    onCategoriesChange(selectedCategories.filter((c) => c !== category))
  }

  const addCustomCategory = () => {
    const trimmedSearchTerm = searchTerm.trim()
    if (trimmedSearchTerm && !selectedCategories.includes(trimmedSearchTerm)) {
      onCategoriesChange([...selectedCategories, trimmedSearchTerm])
      setSearchTerm("")
      setIsOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge key={category} variant="default" className="flex items-center gap-1 pr-1">
              {category}
              <button onClick={() => removeCategory(category)} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
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

      {/* Category Dropdown */}
      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
            <ScrollArea className="max-h-60">
              <div className="p-2">
                {filteredCategories.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          toggleCategory(category)
                          setSearchTerm("")
                          setIsOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 ${
                          selectedCategories.includes(category) ? "bg-blue-50 text-blue-700" : ""
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No categories found matching "{searchTerm}"
                    {searchTerm.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addCustomCategory}
                        className="w-full justify-start mt-2"
                      >
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
