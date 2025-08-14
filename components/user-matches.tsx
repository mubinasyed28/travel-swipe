"use client"
import { motion } from "framer-motion"
import { X, Users, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTravelContext, type UserProfile } from "@/context/travel-context"
import Image from "next/image"
import Link from "next/link"

interface UserMatchesProps {
  onClose: () => void
}

// Mock user data for matches - using reliable placeholder images
export const mockUsers: UserProfile[] = [
  {
    id: "shriya-profile",
    name: "Shriya",
    age: 20,
    profilePic: "https://picsum.photos/seed/shriya/400/400",
    location: "Mumbai, India",
    liked: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    saved: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    bio: "Passionate traveler and explorer, always seeking new adventures and beautiful sights around the world. Let's discover amazing places together!",
    interests: ["Adventure", "Photography", "Food", "Culture", "Scenic", "Urban"],
    gender: "Female",
    race: ["Indian"],
    religion: ["Christianity"],
    photoDump: [
      "https://picsum.photos/seed/shriya1/400/300",
      "https://picsum.photos/seed/shriya2/400/300",
      "https://picsum.photos/seed/shriya3/400/300",
    ],
  },
  {
    id: "aranya-profile",
    name: "Aranya",
    age: 22,
    profilePic: "https://picsum.photos/seed/aranya/400/400",
    location: "Delhi, India",
    liked: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    saved: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    bio: "Tech enthusiast and outdoor adventurer. Always up for exploring new places and capturing moments.",
    interests: ["Tech", "Outdoors", "Photography", "Urban", "Nature"],
    gender: "Male",
    race: ["Indian"],
    religion: ["Hinduism"],
    photoDump: [
      "https://picsum.photos/seed/aranya1/400/300",
      "https://picsum.photos/seed/aranya2/400/300",
      "https://picsum.photos/seed/aranya3/400/300",
    ],
  },
  {
    id: "priya-profile",
    name: "Priya",
    age: 24,
    profilePic: "https://picsum.photos/seed/priya/400/400",
    location: "Bangalore, India",
    liked: [1, 3, 5, 7, 9],
    saved: [2, 4, 6, 8, 10],
    bio: "Software engineer by day, foodie by heart. Love exploring local cuisines and hidden gems in the city.",
    interests: ["Foodie", "Tech", "Urban", "Cultural", "Shopping"],
    gender: "Female",
    race: ["Indian"],
    religion: ["Hinduism"],
    photoDump: [
      "https://picsum.photos/seed/priya1/400/300",
      "https://picsum.photos/seed/priya2/400/300",
      "https://picsum.photos/seed/priya3/400/300",
      "https://picsum.photos/seed/priya4/400/300",
    ],
  },
  {
    id: "rahul-profile",
    name: "Rahul",
    age: 27,
    profilePic: "https://picsum.photos/seed/rahul/400/400",
    location: "Chennai, India",
    liked: [2, 4, 6, 8],
    saved: [1, 3, 5, 7, 9],
    bio: "Marketing professional with a passion for history and architecture. Weekend warrior exploring ancient temples.",
    interests: ["Historic", "Architecture", "Cultural", "Photography", "Spiritual"],
    gender: "Male",
    race: ["Indian"],
    religion: ["Hinduism"],
    photoDump: [
      "https://picsum.photos/seed/rahul1/400/300",
      "https://picsum.photos/seed/rahul2/400/300",
      "https://picsum.photos/seed/rahul3/400/300",
    ],
  },
  {
    id: "ananya-profile",
    name: "Ananya",
    age: 23,
    profilePic: "https://picsum.photos/seed/ananya/400/400",
    location: "Pune, India",
    liked: [1, 2, 3, 4, 5],
    saved: [6, 7, 8, 9, 10],
    bio: "Graphic designer who finds inspiration in nature and scenic landscapes. Always ready for a mountain trek!",
    interests: ["Nature", "Scenic", "Adventure", "Photography", "Art"],
    gender: "Female",
    race: ["Indian"],
    religion: ["Sikhism"],
    photoDump: [
      "https://picsum.photos/seed/ananya1/400/300",
      "https://picsum.photos/seed/ananya2/400/300",
      "https://picsum.photos/seed/ananya3/400/300",
      "https://picsum.photos/seed/ananya4/400/300",
      "https://picsum.photos/seed/ananya5/400/300",
    ],
  },
  {
    id: "vikram-profile",
    name: "Vikram",
    age: 29,
    profilePic: "https://picsum.photos/seed/vikram/400/400",
    location: "Hyderabad, India",
    liked: [3, 6, 9],
    saved: [1, 4, 7, 10],
    bio: "Fitness enthusiast and adventure seeker. Love water sports, trekking, and anything that gets the adrenaline pumping!",
    interests: ["Adventure", "Sports", "Water Sports", "Fitness", "Beach"],
    gender: "Male",
    race: ["Indian"],
    religion: ["Christianity"],
    photoDump: [
      "https://picsum.photos/seed/vikram1/400/300",
      "https://picsum.photos/seed/vikram2/400/300",
      "https://picsum.photos/seed/vikram3/400/300",
    ],
  },
]

// Helper function to calculate distance between two points (simplified for mock data)
// In a real app, you'd use actual geolocation and a more precise distance calculation.
const calculateDistance = (loc1: string, loc2: string): number => {
  // This is a very simplified mock. In a real app, you'd use lat/lon.
  // For demonstration, let's just say locations starting with the same letter are "close"
  // and others are "far".
  const city1 = loc1.split(",")[0].trim().toLowerCase()
  const city2 = loc2.split(",")[0].trim().toLowerCase()

  if (city1 === city2) return 5 // Very close
  if (city1[0] === city2[0]) return 20 // Somewhat close
  return 70 // Far
}

function findMatchingUsers(
  userLiked: number[],
  userSaved: number[],
  users: typeof mockUsers,
  userLocation: string,
  genderFilters: string[],
  raceFilters: string[],
  religionFilters: string[],
  maxDistance: number,
) {
  const userDestinations = [...userLiked, ...userSaved]

  return users
    .map((user) => {
      // Apply gender filter
      if (genderFilters.length > 0 && !genderFilters.includes(user.gender)) {
        return null // Skip if gender doesn't match filter
      }

      // Apply race filter
      if (raceFilters.length > 0 && !raceFilters.some((filterRace) => user.race.includes(filterRace))) {
        return null // Skip if race doesn't match any filter
      }

      // Apply religion filter
      if (
        religionFilters.length > 0 &&
        !religionFilters.some((filterReligion) => user.religion.includes(filterReligion))
      ) {
        return null // Skip if religion doesn't match any filter
      }

      // Apply distance filter
      const distance = calculateDistance(userLocation, user.location)
      if (distance > maxDistance) {
        return null // Skip if user is too far
      }

      const userAllDestinations = [...(user.liked || []), ...(user.saved || [])]
      const commonDestinations = userDestinations.filter((id) => userAllDestinations.includes(id))
      const similarity = commonDestinations.length / Math.max(userDestinations.length, userAllDestinations.length, 1)

      return {
        ...user,
        commonDestinations: commonDestinations.length,
        similarity,
        distance, // Include distance for display/debugging
      }
    })
    .filter(Boolean) as (UserProfile & { commonDestinations: number; similarity: number; distance: number })[] // Filter out nulls and assert type
}

export function UserMatches({ onClose }: UserMatchesProps) {
  const { likedDestinations, savedDestinations, userProfile } = useTravelContext()
  const { activeFilters } = useTravelContext() // Access active filters from context

  const userLikedIds = likedDestinations.map((d) => d.id)
  const userSavedIds = savedDestinations.map((d) => d.id)

  // Find matching users based on liked and saved destinations and new filters
  const matches = findMatchingUsers(
    userLikedIds,
    userSavedIds,
    mockUsers,
    userProfile.location, // Pass user's location for distance calculation
    activeFilters.genders,
    activeFilters.races,
    activeFilters.religions,
    activeFilters.maxDistance,
  )
    .filter((user) => user.commonDestinations > 0) // Still require common destinations
    .sort((a, b) => b.similarity - a.similarity)

  // Get destination details for common destinations
  const getDestinationName = (id: number) => {
    const allDestinations = [...likedDestinations, ...savedDestinations]
    const destination = allDestinations.find((d) => d.id === id)
    return destination ? destination.name : `Destination ${id}`
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Travel Buddies</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4">
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden">
                          <Image
                            src={match.profilePic || "/placeholder.svg"}
                            alt={match.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {match.name}, {match.age}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin size={12} className="mr-1" />
                            <span>
                              {match.location} ({match.distance} km away)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Match Score</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {Math.round(match.similarity * 100)}% match
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.round(match.similarity * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm mb-2">
                          <span className="font-medium">{match.commonDestinations} destinations</span> in common
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {/* Find common destinations between current user and match */}
                          {[...userLikedIds, ...userSavedIds]
                            .filter((id) => (match.liked || []).includes(id) || (match.saved || []).includes(id))
                            .slice(0, 3)
                            .map((id) => (
                              <Badge key={id} variant="secondary" className="text-xs">
                                {getDestinationName(id)}
                              </Badge>
                            ))}
                          {match.commonDestinations > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{match.commonDestinations - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">{match.bio}</p>

                      <Link href={`/matches/${match.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center gap-1 bg-transparent"
                        >
                          View Profile <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No matches found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {userLikedIds.length + userSavedIds.length === 0
                    ? "Start liking and saving destinations to find travel buddies with similar interests!"
                    : "Like and save more destinations to find matches."}
                </p>
                {/* Display current filters for debugging/user feedback */}
                {(activeFilters.genders.length > 0 ||
                  activeFilters.races.length > 0 ||
                  activeFilters.religions.length > 0 ||
                  activeFilters.maxDistance < 100) && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Current match filters:{" "}
                    {activeFilters.genders.length > 0 && `Gender: ${activeFilters.genders.join(", ")}`}
                    {activeFilters.races.length > 0 &&
                      `${activeFilters.genders.length > 0 ? "; " : ""}Race: ${activeFilters.races.join(", ")}`}
                    {activeFilters.religions.length > 0 &&
                      `${activeFilters.genders.length > 0 || activeFilters.races.length > 0 ? "; " : ""}Religion: ${activeFilters.religions.join(", ")}`}
                    {activeFilters.maxDistance < 100 &&
                      `${activeFilters.genders.length > 0 || activeFilters.races.length > 0 || activeFilters.religions.length > 0 ? "; " : ""}Max Distance: ${activeFilters.maxDistance} km`}
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  )
}
