"use client"

import { useTravelContext } from "@/context/travel-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Heart, Bookmark, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SavedPage() {
  const { likedDestinations, savedDestinations, clearCache } = useTravelContext()

  const allSaved = [...likedDestinations, ...savedDestinations]

  if (allSaved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No saved destinations yet</h2>
        <p className="text-gray-600 mb-6">Start swiping to save places you love!</p>
        <Link href="/">
          <Button>Discover Places</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Destinations</h1>
          <p className="text-gray-600">{allSaved.length} places saved</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearCache}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="space-y-4">
        {likedDestinations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Liked ({likedDestinations.length})
            </h2>
            <div className="grid gap-4">
              {likedDestinations.map((destination) => (
                <Card key={`liked-${destination.id}`} className="overflow-hidden">
                  <div className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{destination.name}</h3>
                        <div className="flex items-center">
                          <Star className="fill-yellow-400 text-yellow-400 mr-1" size={14} />
                          <span className="text-sm">{destination.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center mb-2 text-gray-600">
                        <MapPin size={12} className="mr-1" />
                        <span className="text-xs">
                          {destination.location.city}, {destination.location.country}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{destination.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {destination.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {savedDestinations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-blue-500" />
              Saved ({savedDestinations.length})
            </h2>
            <div className="grid gap-4">
              {savedDestinations.map((destination) => (
                <Card key={`saved-${destination.id}`} className="overflow-hidden">
                  <div className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{destination.name}</h3>
                        <div className="flex items-center">
                          <Star className="fill-yellow-400 text-yellow-400 mr-1" size={14} />
                          <span className="text-sm">{destination.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center mb-2 text-gray-600">
                        <MapPin size={12} className="mr-1" />
                        <span className="text-xs">
                          {destination.location.city}, {destination.location.country}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{destination.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {destination.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
