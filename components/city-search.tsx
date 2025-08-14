"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Comprehensive list of T1 and T2 Indian cities
const INDIAN_CITIES = {
  T1: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Goa"],
  T2: [
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Kalyan",
    "Vasai",
    "Varanasi",
    "Srinagar",
    "Aurangabad",
    "Dhanbad",
    "Amritsar",
    "Navi",
    "Allahabad",
    "Ranchi",
    "Howrah",
    "Coimbatore",
    "Jabalpur",
    "Gwalior",
    "Vijayawada",
    "Madurai",
    "Raipur",
    "Kota",
    "Chandigarh",
    "Guwahati",
    "Solapur",
    "Hubli",
    "Tiruchirappalli",
    "Bareilly",
    "Mysore",
    "Tiruppur",
    "Gurgaon",
    "Aligarh",
    "Jalandhar",
    "Bhubaneswar",
    "Salem",
    "Warangal",
    "Guntur",
    "Bhiwandi",
    "Saharanpur",
    "Gorakhpur",
    "Bikaner",
    "Amravati",
    "Noida",
    "Jamshedpur",
    "Bhilai",
    "Cuttack",
    "Firozabad",
    "Kochi",
    "Nellore",
    "Bhavnagar",
    "Dehradun",
    "Durgapur",
    "Asansol",
    "Rourkela",
    "Nanded",
    "Kolhapur",
    "Ajmer",
    "Akola",
    "Gulbarga",
    "Jamnagar",
    "Ujjain",
    "Loni",
    "Siliguri",
    "Jhansi",
    "Ulhasnagar",
    "Jammu",
    "Sangli",
    "Mangalore",
    "Erode",
    "Belgaum",
    "Ambattur",
    "Tirunelveli",
    "Malegaon",
    "Gaya",
    "Jalgaon",
    "Udaipur",
    "Maheshtala",
  ],
}

const ALL_CITIES = [...INDIAN_CITIES.T1, ...INDIAN_CITIES.T2].sort()

interface CitySearchProps {
  selectedCities: string[]
  onCitiesChange: (cities: string[]) => void
  placeholder?: string
}

export function CitySearch({ selectedCities, onCitiesChange, placeholder = "Search cities..." }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredCities = useMemo(() => {
    if (!searchTerm) return ALL_CITIES.slice(0, 20) // Show first 20 cities by default

    return ALL_CITIES.filter((city) => city.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10) // Limit to 10 results when searching
  }, [searchTerm])

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      onCitiesChange(selectedCities.filter((c) => c !== city))
    } else {
      onCitiesChange([...selectedCities, city])
    }
  }

  const removeCity = (city: string) => {
    onCitiesChange(selectedCities.filter((c) => c !== city))
  }

  const getCityTier = (city: string) => {
    if (INDIAN_CITIES.T1.includes(city)) return "T1"
    if (INDIAN_CITIES.T2.includes(city)) return "T2"
    return ""
  }

  return (
    <div className="space-y-3">
      {/* Selected Cities */}
      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCities.map((city) => (
            <Badge key={city} variant="default" className="flex items-center gap-1 pr-1">
              <span className="text-xs opacity-70">{getCityTier(city)}</span>
              {city}
              <button onClick={() => removeCity(city)} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
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

      {/* City Dropdown */}
      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
            <ScrollArea className="max-h-60">
              <div className="p-2">
                {filteredCities.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          toggleCity(city)
                          setSearchTerm("")
                          setIsOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center justify-between ${
                          selectedCities.includes(city) ? "bg-blue-50 text-blue-700" : ""
                        }`}
                      >
                        <span>{city}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            getCityTier(city) === "T1"
                              ? "border-blue-500 text-blue-700"
                              : "border-gray-400 text-gray-600"
                          }`}
                        >
                          {getCityTier(city)}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No cities found matching "{searchTerm}"</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Backdrop to close dropdown */}
          <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Search from {ALL_CITIES.length} Indian cities • {INDIAN_CITIES.T1.length} T1 cities • {INDIAN_CITIES.T2.length}{" "}
        T2 cities
      </p>
    </div>
  )
}
