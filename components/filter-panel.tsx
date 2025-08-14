"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { CitySearch } from "@/components/city-search"
import { CategorySearch } from "@/components/category-search"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSearchSelect } from "@/components/multi-search-select" // ➕ NEW

interface FilterPanelProps {
  onClose: () => void
  activeFilters: {
    locations: string[]
    genders: string[]
    races: string[]
    religions: string[] // ➕ NEW
    placeTypes: string[]
    maxDistance: number
  }
  setActiveFilters: (filters: {
    locations: string[]
    genders: string[]
    races: string[]
    religions: string[] // ➕ NEW
    placeTypes: string[]
    maxDistance: number
  }) => void
}

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"]
const RACE_OPTIONS = [
  "Asian",
  "Black",
  "White",
  "Hispanic or Latino",
  "Indigenous",
  "Middle Eastern or North African",
  "Other",
]
const RELIGION_OPTIONS = [
  // ➕ NEW
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Sikhism",
  "Judaism",
  "Atheism",
  "Agnosticism",
  "Spiritual but not religious",
  "Other",
]

export function FilterPanel({ onClose, activeFilters, setActiveFilters }: FilterPanelProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(activeFilters.locations)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(activeFilters.placeTypes)
  const [selectedGenders, setSelectedGenders] = useState<string[]>(activeFilters.genders)
  const [selectedRaces, setSelectedRaces] = useState<string[]>(activeFilters.races ?? [])
  const [selectedReligions, setSelectedReligions] = useState<string[]>(activeFilters.religions ?? []) // ➕ NEW
  const [maxDistance, setMaxDistance] = useState<number[]>([activeFilters.maxDistance])

  const handleGenderChange = (value: string) => {
    setSelectedGenders(value === "Any" ? [] : [value])
  }

  const applyFilters = () => {
    setActiveFilters({
      locations: selectedLocations,
      genders: selectedGenders,
      races: selectedRaces,
      religions: selectedReligions, // ➕ NEW
      placeTypes: selectedCategories,
      maxDistance: maxDistance[0],
    })
    onClose()
  }

  const clearFilters = () => {
    setSelectedLocations([])
    setSelectedCategories([])
    setSelectedGenders([])
    setSelectedRaces([])
    setSelectedReligions([]) // ➕ NEW
    setMaxDistance([50])
  }

  const totalFiltersSelected =
    selectedLocations.length +
    selectedCategories.length +
    selectedGenders.length +
    selectedRaces.length +
    selectedReligions.length // ➕ NEW

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[85vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Filter Destinations & Matches</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="p-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Cities (for Destinations)</h3>
              <CitySearch
                selectedCities={selectedLocations}
                onCitiesChange={setSelectedLocations}
                placeholder="Search Indian cities..."
              />
            </div>

            <div>
              <h3 className="font-medium mb-3">Categories (for Destinations)</h3>
              <CategorySearch
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                placeholder="Search or add categories..."
              />
            </div>

            <div>
              <h3 className="font-medium mb-3">Gender (for Matches)</h3>
              <Select
                onValueChange={handleGenderChange}
                value={selectedGenders.length > 0 ? selectedGenders[0] : "Any"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  {GENDER_OPTIONS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium mb-3">Race/Ethnicity (for Matches)</h3>
              <MultiSearchSelect
                options={RACE_OPTIONS}
                selectedItems={selectedRaces}
                onItemsChange={setSelectedRaces}
                placeholder="Search or add races..."
                allowCustom={true}
              />
            </div>

            <div>
              <h3 className="font-medium mb-3">Religion (for Matches)</h3> {/* ➕ NEW */}
              <MultiSearchSelect
                options={RELIGION_OPTIONS}
                selectedItems={selectedReligions}
                onItemsChange={setSelectedReligions}
                placeholder="Search or add religions..."
                allowCustom={true}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="distance-filter" className="font-medium">
                  Maximum Distance from Me (for Matches)
                </Label>
                <span className="text-sm text-muted-foreground">{maxDistance[0]} km</span>
              </div>
              <Slider
                id="distance-filter"
                min={5}
                max={100}
                step={5}
                value={maxDistance}
                onValueChange={setMaxDistance}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">Find matches within {maxDistance[0]} km of your location</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{totalFiltersSelected} selected</span>
            <Button onClick={applyFilters} className="flex items-center gap-1">
              <Check size={16} />
              Apply
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
