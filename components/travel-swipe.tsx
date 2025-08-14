"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { MapPin, Star, Filter, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { SmartImage } from "@/components/smart-image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTravelContext } from "@/context/travel-context"
import { FilterPanel } from "@/components/filter-panel"
import { MatchPopup } from "@/components/match-popup"
import { mockUsers } from "@/components/user-matches" // Import mock users

export default function TravelSwipe() {
  const {
    destinations,
    likedDestinations,
    savedDestinations,
    isLoading,
    isGenerating,
    swipeCount,
    likeDestination,
    saveDestination,
    dislikeDestination,
    generateNewDestinations,
    incrementSwipeCount,
    activeFilters,
    setActiveFilters,
  } = useTravelContext()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showMatchPopup, setShowMatchPopup] = useState(false)
  const [matchedUser, setMatchedUser] = useState<any>(null) // State to hold the matched user for popup
  const [processedIds, setProcessedIds] = useState<Set<number>>(new Set())
  const [generationError, setGenerationError] = useState<string | null>(null)
  // Removed matchPopupCounter state

  // Motion values for swipe gestures
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const cardOpacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  // Swipe indicators
  const likeOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1])
  const dislikeOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0])
  const saveOpacity = useTransform(y, [-200, -100, 0], [1, 0.5, 0])

  const dragConstraintsRef = useRef(null)

  const handleGenerateDestinations = useCallback(async () => {
    try {
      setGenerationError(null)
      console.log("[TravelSwipe] Calling generateNewDestinations from context with current active filters.")
      await generateNewDestinations(activeFilters)
    } catch (error) {
      setGenerationError("Failed to generate new destinations. Please try again.")
      console.error("[TravelSwipe] Generation error:", error)
    }
  }, [generateNewDestinations, activeFilters])

  // Check for match popup every 10 swipes, picking a random user from mockUsers
  useEffect(() => {
    if (swipeCount > 0 && swipeCount % 10 === 0) {
      const randomMatch = mockUsers[Math.floor(Math.random() * mockUsers.length)] // Randomly pick from available mockUsers

      // Calculate common destinations for the mock match
      const userLikedIds = likedDestinations.map((d) => d.id)
      const userSavedIds = savedDestinations.map((d) => d.id)
      const userAllDestinations = [...userLikedIds, ...userSavedIds]
      const matchAllDestinations = [...(randomMatch.liked || []), ...(randomMatch.saved || [])]
      const commonCount = userAllDestinations.filter((id) => matchAllDestinations.includes(id)).length

      setMatchedUser({ ...randomMatch, commonDestinations: commonCount })
      setShowMatchPopup(true)
    }
  }, [swipeCount, likedDestinations, savedDestinations]) // Removed matchPopupCounter from dependencies

  // Filter destinations based on active filters and processed status
  const getFilteredDestinations = useCallback(() => {
    let filtered = destinations.filter(
      (dest) =>
        !processedIds.has(dest.id) &&
        !likedDestinations.find((liked) => liked.id === dest.id) &&
        !savedDestinations.find((saved) => saved.id === dest.id),
    )

    // Apply location filters with ULTRA STRICT checking
    if (activeFilters.locations.length > 0) {
      filtered = filtered.filter((dest) => {
        if (!dest.location?.city) return false

        const destCity = dest.location.city.toLowerCase().trim()
        const isMatch = activeFilters.locations.some((filterCity) => {
          const filterCityLower = filterCity.toLowerCase().trim()
          const exactMatch = destCity === filterCityLower

          return exactMatch
        })

        return isMatch
      })
    }

    // Apply category filters
    if (activeFilters.placeTypes.length > 0) {
      filtered = filtered.filter((dest) => activeFilters.placeTypes.some((type) => dest.tags.includes(type)))
    }

    return filtered
  }, [destinations, processedIds, likedDestinations, savedDestinations, activeFilters])

  const availableDestinations = getFilteredDestinations()
  const currentDestination = availableDestinations[currentIndex]

  // Generate more destinations when running low
  useEffect(() => {
    console.log(
      `[TravelSwipe] Effect: currentIndex=${currentIndex}, availableDestinations.length=${availableDestinations.length}, isGenerating=${isGenerating}`,
    )
    if (availableDestinations.length - currentIndex < 3 && !isGenerating) {
      console.log("[TravelSwipe] Triggering handleGenerateDestinations due to low count.")
      handleGenerateDestinations()
    }
  }, [currentIndex, availableDestinations.length, isGenerating, activeFilters, handleGenerateDestinations])

  const resetSwipe = () => {
    x.set(0)
    y.set(0)
    setSwipeDirection(null)
  }

  const handleLike = () => {
    if (currentDestination) {
      likeDestination(currentDestination)
      setProcessedIds((prev) => new Set(prev).add(currentDestination.id))
      setCurrentIndex((prev) => prev + 1)
      incrementSwipeCount()
      setTimeout(resetSwipe, 300)
    }
  }

  const handleDislike = () => {
    if (currentDestination) {
      dislikeDestination(currentDestination)
      setProcessedIds((prev) => new Set(prev).add(currentDestination.id))
      setCurrentIndex((prev) => prev + 1)
      incrementSwipeCount()
      setTimeout(resetSwipe, 300)
    }
  }

  const handleSave = () => {
    if (currentDestination) {
      saveDestination(currentDestination)
      setProcessedIds((prev) => new Set(prev).add(currentDestination.id))
      setCurrentIndex((prev) => prev + 1)
      incrementSwipeCount()
      setTimeout(resetSwipe, 300)
    }
  }

  if (isLoading && availableDestinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-gray-600">Loading destinations...</p>
      </div>
    )
  }

  if (!currentDestination) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen text-center p-8">
        <h2 className="text-2xl font-bold mb-4">No more destinations!</h2>
        <p className="text-gray-600 mb-6">
          {activeFilters.locations.length > 0
            ? `Let me generate some new places in ${activeFilters.locations.join(", ")} for you using AI...`
            : "Let me generate some new places for you using AI..."}
        </p>

        {generationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{generationError}</span>
          </div>
        )}

        <Button onClick={handleGenerateDestinations} disabled={isGenerating} className="flex items-center gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate with Mistral AI
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
      {/* Swipe Cards Container */}
      <div className="relative w-full max-w-sm h-[700px]" ref={dragConstraintsRef}>
        {/* Background card */}
        {availableDestinations[currentIndex + 1] && (
          <div
            className="absolute w-full h-full"
            style={{
              transform: "scale(0.95) translateY(10px)",
              opacity: 0.6,
              zIndex: 1,
            }}
          >
            <Card className="w-full h-full overflow-hidden rounded-xl shadow-md">
              <div className="absolute inset-0">
                <SmartImage
                  src={availableDestinations[currentIndex + 1].image || "/placeholder.svg"}
                  alt={availableDestinations[currentIndex + 1].name}
                  fallbackQuery={`${availableDestinations[currentIndex + 1].name}, ${availableDestinations[currentIndex + 1].location.city}`}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Active card */}
        <AnimatePresence>
          <motion.div
            key={currentDestination.id}
            className="absolute w-full h-full"
            drag
            dragConstraints={dragConstraintsRef}
            onDragEnd={(event, info) => {
              const xOffset = info.offset.x
              const yOffset = info.offset.y
              const xVelocity = info.velocity.x
              const yVelocity = info.velocity.y

              const isHorizontalSwipe = Math.abs(xOffset) > Math.abs(yOffset)

              if (isHorizontalSwipe) {
                if (xOffset > 100 || (xVelocity > 0.5 && xOffset > 50)) {
                  handleLike()
                  setSwipeDirection("right")
                } else if (xOffset < -100 || (xVelocity < -0.5 && xOffset < -50)) {
                  handleDislike()
                  setSwipeDirection("left")
                } else {
                  resetSwipe()
                }
              } else {
                if (yOffset < -100 || (yVelocity < -0.5 && yOffset < -50)) {
                  handleSave()
                  setSwipeDirection("up")
                } else {
                  resetSwipe()
                }
              }
            }}
            style={{ x, y, rotate, opacity: cardOpacity, zIndex: 10 }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0.95,
              opacity: 0,
              x: swipeDirection === "right" ? 300 : swipeDirection === "left" ? -300 : 0,
              y: swipeDirection === "up" ? -300 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full h-full overflow-hidden relative cursor-pointer rounded-xl shadow-lg">
              <div className="absolute inset-0">
                <SmartImage
                  src={currentDestination.image || "/placeholder.svg"}
                  alt={currentDestination.name}
                  fallbackQuery={`${currentDestination.name}, ${currentDestination.location.city}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Filter Button - Top Right Corner */}
              <div className="absolute top-4 right-4 z-20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowFilterPanel(true)
                  }}
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {activeFilters.locations.length + activeFilters.placeTypes.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {activeFilters.locations.length + activeFilters.placeTypes.length}
                    </span>
                  )}
                </Button>
              </div>

              {/* AI Generated Badge */}
              {currentDestination.id > 1000 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Generated
                </div>
              )}

              {/* Status indicators */}
              {activeFilters.locations.length > 0 && (
                <div className="absolute top-16 left-4 bg-blue-500/80 text-white px-2 py-1 rounded-full text-xs">
                  📍 {activeFilters.locations.join(", ")}
                </div>
              )}

              {isGenerating && (
                <div className="absolute top-16 right-4 bg-purple-500/80 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  AI generating...
                </div>
              )}

              {/* Swipe indicators */}
              <motion.div
                className="absolute top-1/3 right-8 border-4 border-green-500 rounded-lg px-4 py-2 transform rotate-[-15deg]"
                style={{ opacity: likeOpacity }}
              >
                <span className="text-green-500 font-bold text-2xl">LIKE</span>
              </motion.div>

              <motion.div
                className="absolute top-1/3 left-8 border-4 border-red-500 rounded-lg px-4 py-2 transform rotate-[15deg]"
                style={{ opacity: dislikeOpacity }}
              >
                <span className="text-red-500 font-bold text-2xl">NOPE</span>
              </motion.div>

              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-blue-500 rounded-lg px-4 py-2"
                style={{ opacity: saveOpacity }}
              >
                <span className="text-blue-500 font-bold text-2xl">SAVE</span>
              </motion.div>

              {/* Destination info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center mb-2">
                  <h2 className="text-2xl font-bold mr-2">{currentDestination.name}</h2>
                  <div className="flex items-center bg-white/20 px-2 py-1 rounded-full">
                    <Star className="fill-yellow-400 text-yellow-400 mr-1" size={14} />
                    <span className="text-sm">{currentDestination.rating}</span>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span className="text-sm">
                    {currentDestination.location.city}, {currentDestination.location.country}
                  </span>
                </div>

                <p className="mb-4 text-sm text-white/90 line-clamp-3">{currentDestination.description}</p>

                <div className="flex flex-wrap gap-2">
                  {currentDestination.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Swipe Instructions */}
                <div className="mt-4 text-center text-xs text-white/70">
                  Swipe right to like • Swipe left to pass • Swipe up to save
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <FilterPanel
            onClose={() => setShowFilterPanel(false)}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        )}
      </AnimatePresence>

      {/* Match Popup */}
      <AnimatePresence>
        {showMatchPopup && matchedUser && (
          <MatchPopup onClose={() => setShowMatchPopup(false)} matchedUser={matchedUser} />
        )}
      </AnimatePresence>
    </div>
  )
}
