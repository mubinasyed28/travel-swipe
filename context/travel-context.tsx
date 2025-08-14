"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { generateDestinationsAction, getRecommendationsAction, getGooglePlacePhotoUrl } from "@/app/actions" // Import new server action

// Destination type definition
export type Destination = {
  id: number
  name: string
  image: string
  description: string
  rating: number
  tags: string[]
  location: {
    city?: string
    country: string
  }
}

export type UserProfile = {
  id: string
  name: string
  age: number
  profilePic: string
  location: string
  bio: string
  interests: string[]
  gender: string // Added gender
  race: string[] // Added race as an array for multiple selections
  religion: string[] // ➕ NEW: Added religion as an array for multiple selections
  liked?: number[] // Optional: for mock matched users
  saved?: number[] // Optional: for mock matched users
  photoDump?: string[] // ➕ NEW: Array of image URLs for a photo gallery
}

// Define the type for active filters
export type ActiveFilters = {
  locations: string[]
  genders: string[]
  races: string[]
  religions: string[]
  placeTypes: string[]
  maxDistance: number
}

// Context type definition
type TravelContextType = {
  destinations: Destination[]
  likedDestinations: Destination[]
  savedDestinations: Destination[]
  isLoading: boolean
  isGenerating: boolean
  generationError: string | null
  swipeCount: number
  userProfile: UserProfile // This will now be the *currently selected* profile
  customProfiles: UserProfile[] // NEW: All custom profiles
  currentProfileId: string // NEW: ID of the currently active profile
  activeFilters: ActiveFilters // Expose activeFilters from context
  matchedUsers: UserProfile[] // NEW: Users who have appeared in a match popup
  acceptedUserIds: Set<string> // NEW: IDs of users accepted (Yex)
  rejectedUserIds: Set<string> // NEW: IDs of users rejected (Nex)

  // Actions
  likeDestination: (destination: Destination) => void
  saveDestination: (destination: Destination) => void
  dislikeDestination: (destination: Destination) => void
  generateNewDestinations: (filters?: ActiveFilters) => Promise<void> // Use ActiveFilters type
  getPersonalizedRecommendations: () => Promise<string>
  clearCache: () => void
  incrementSwipeCount: () => void
  updateUserProfile: (profile: Partial<UserProfile>) => void // Updates the *current* profile
  setActiveFilters: (filters: ActiveFilters) => void // Add setter for activeFilters
  addOrUpdateCustomProfile: (profile: UserProfile) => void // NEW: Add or update a profile
  selectProfile: (profileId: string) => void // NEW: Select an active profile
  deleteProfile: (profileId: string) => void // NEW: Delete a profile
  acceptUser: (userId: string) => void // NEW: Accept a matched user (Yex)
  rejectUser: (userId: string) => void // NEW: Reject a matched user (Nex)
}

// Create context
const TravelContext = createContext<TravelContextType | undefined>(undefined)

// Cache keys for localStorage
const CACHE_KEYS = {
  DESTINATIONS: "travel_destinations",
  LIKED: "travel_liked",
  SAVED: "travel_saved",
  LAST_GENERATION: "travel_last_generation",
  SWIPE_COUNT: "travel_swipe_count",
  ACTIVE_FILTERS: "travel_active_filters", // New cache key for active filters
  CUSTOM_PROFILES: "travel_custom_profiles", // NEW
  CURRENT_PROFILE_ID: "travel_current_profile_id", // NEW
  MATCHED_USERS: "travel_matched_users", // NEW
  ACCEPTED_USER_IDS: "travel_accepted_user_ids", // NEW
  REJECTED_USER_IDS: "travel_rejected_user_ids", // NEW
}

// Initial destinations metadata (without images, which will be fetched dynamically)
// These are now the *only* initial destinations, no fallbacks.
const INITIAL_DESTINATIONS_METADATA = [
  {
    id: 1,
    name: "Marine Drive",
    description: "The Queen's Necklace - Mumbai's iconic seafront promenade perfect for evening walks and street food.",
    rating: 4.6,
    tags: ["Urban", "Scenic", "Foodie"],
    location: { city: "Mumbai", country: "India" },
  },
  {
    id: 2,
    name: "Gateway of India",
    description: "Historic monument and Mumbai's most famous landmark, offering boat rides to Elephanta Caves.",
    rating: 4.5,
    tags: ["Historic", "Cultural", "Architecture"],
    location: { city: "Mumbai", country: "India" },
  },
  {
    id: 3,
    name: "Colaba Causeway",
    description: "Bustling shopping street with local markets, cafes, and the famous Leopold Cafe.",
    rating: 4.3,
    tags: ["Shopping", "Urban", "Cultural"],
    location: { city: "Mumbai", country: "India" },
  },
  {
    id: 4,
    name: "Bandra-Worli Sea Link",
    description: "Architectural marvel connecting Bandra and Worli with stunning views of Mumbai skyline.",
    rating: 4.7,
    tags: ["Architecture", "Scenic", "Modern"],
    location: { city: "Mumbai", country: "India" },
  },
  {
    id: 5,
    name: "Juhu Beach",
    description: "Popular beach destination famous for street food, especially bhel puri and pav bhaji.",
    rating: 4.2,
    tags: ["Beach", "Foodie", "Family"],
    location: { city: "Mumbai", country: "India" },
  },
  {
    id: 6,
    name: "Red Fort",
    description: "Historic fortified palace and UNESCO World Heritage site showcasing Mughal architecture.",
    rating: 4.4,
    tags: ["Historic", "Cultural", "Architecture"],
    location: { city: "Delhi", country: "India" },
  },
  {
    id: 7,
    name: "India Gate",
    description: "War memorial and iconic landmark surrounded by beautiful gardens and evening lights.",
    rating: 4.3,
    tags: ["Historic", "Scenic", "Cultural"],
    location: { city: "Delhi", country: "India" },
  },
  {
    id: 8,
    name: "Baga Beach",
    description: "Popular beach destination known for water sports, beach shacks, and vibrant nightlife.",
    rating: 4.5,
    tags: ["Beach", "Adventure", "Nightlife"],
    location: { city: "Goa", country: "India" },
  },
  {
    id: 9,
    name: "Basilica of Bom Jesus",
    description: "UNESCO World Heritage site and beautiful example of baroque architecture in India.",
    rating: 4.6,
    tags: ["Historic", "Cultural", "Architecture"],
    location: { city: "Goa", country: "India" },
  },
  {
    id: 10,
    name: "Lalbagh Botanical Garden",
    description: "Historic botanical garden with diverse flora, glass house, and peaceful walking trails.",
    rating: 4.4,
    tags: ["Nature", "Scenic", "Family"],
    location: { city: "Bangalore", country: "India" },
  },
]

// Define initial profiles for your dev team
const INITIAL_DEV_PROFILES: UserProfile[] = [
  {
    id: "dev-john",
    name: "John Doe",
    age: 28,
    profilePic: "https://randomuser.me/api/portraits/men/75.jpg",
    location: "Mumbai, India",
    bio: "Lead Developer. Loves exploring historical sites and trying new tech.",
    interests: ["Historic", "Tech", "Urban", "Foodie"],
    gender: "Male",
    race: ["Asian"],
    religion: ["Agnosticism"],
    photoDump: [
      "https://picsum.photos/seed/john1/400/300",
      "https://picsum.photos/seed/john2/400/300",
      "https://picsum.photos/seed/john3/400/300",
    ],
  },
  {
    id: "dev-jane",
    name: "Jane Smith",
    age: 25,
    profilePic: "https://randomuser.me/api/portraits/women/76.jpg",
    location: "Delhi, India",
    bio: "Frontend Engineer. Passionate about nature, photography, and quiet getaways.",
    interests: ["Nature", "Photography", "Relaxation", "Scenic"],
    gender: "Female",
    race: ["White"],
    religion: ["Spiritual but not religious"],
    photoDump: [
      "https://picsum.photos/seed/jane1/400/300",
      "https://picsum.photos/seed/jane2/400/300",
      "https://picsum.photos/seed/jane3/400/300",
    ],
  },
  {
    id: "dev-mike",
    name: "Mike Johnson",
    age: 32,
    profilePic: "https://randomuser.me/api/portraits/men/77.jpg",
    location: "Goa, India",
    bio: "Backend Specialist. Enjoys adventure sports, beaches, and vibrant nightlife.",
    interests: ["Adventure", "Beach", "Nightlife", "Sports"],
    gender: "Male",
    race: ["Black"],
    religion: ["Christianity"],
    photoDump: [
      "https://picsum.photos/seed/mike1/400/300",
      "https://picsum.photos/seed/mike2/400/300",
      "https://picsum.photos/seed/mike3/400/300",
    ],
  },
  {
    id: "dev-sara",
    name: "Sara Lee",
    age: 29,
    profilePic: "https://randomuser.me/api/portraits/women/78.jpg",
    location: "Bangalore, India",
    bio: "QA Engineer. A true foodie who loves exploring local markets and culinary experiences.",
    interests: ["Foodie", "Local Markets", "Cultural", "Shopping"],
    gender: "Female",
    race: ["Asian"],
    religion: ["Buddhism"],
    photoDump: [
      "https://picsum.photos/seed/sara1/400/300",
      "https://picsum.photos/seed/sara2/400/300",
      "https://picsum.photos/seed/sara3/400/300",
    ],
  },
]

const INITIAL_ACTIVE_FILTERS: ActiveFilters = {
  locations: [],
  genders: [],
  races: [],
  religions: [],
  placeTypes: [],
  maxDistance: 50,
}

// Provider component
export function TravelProvider({ children }: { children: ReactNode }) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [likedDestinations, setLikedDestinations] = useState<Destination[]>([])
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [swipeCount, setSwipeCount] = useState(0)

  // NEW: State for managing multiple profiles
  const [customProfiles, setCustomProfiles] = useState<UserProfile[]>([])
  const [currentProfileId, setCurrentProfileId] = useState<string>("")

  const [activeFilters, setActiveFiltersState] = useState<ActiveFilters>(INITIAL_ACTIVE_FILTERS) // State for active filters

  // NEW: States for managing matched users
  const [matchedUsers, setMatchedUsers] = useState<UserProfile[]>([])
  const [acceptedUserIds, setAcceptedUserIds] = useState<Set<string>>(new Set())
  const [rejectedUserIds, setRejectedUserIds] = useState<Set<string>>(new Set())

  // Derived state for the currently active user profile
  const userProfile = customProfiles.find((p) => p.id === currentProfileId) || INITIAL_DEV_PROFILES[0] // Fallback to first dev profile

  // Load data from cache on mount or fetch initial images
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cachedDestinations = localStorage.getItem(CACHE_KEYS.DESTINATIONS)

        if (cachedDestinations) {
          console.log("[TravelProvider] Cached destinations found. Loading from cache.")
          setDestinations(JSON.parse(cachedDestinations))
        } else {
          console.log("[TravelProvider] No cached destinations found. Fetching initial destinations with images.")
          setIsLoading(true)
          const initialDestinationsWithImages: Destination[] = await Promise.all(
            INITIAL_DESTINATIONS_METADATA.map(async (destMeta) => {
              console.log(
                `[TravelProvider] Calling getGooglePlacePhotoUrl for initial: ${destMeta.name}, ${destMeta.location.city}`,
              )
              const googlePhotoUrl = await getGooglePlacePhotoUrl(destMeta.name, destMeta.location.city || "")
              console.log(`[TravelProvider] Received Google Photo URL for initial ${destMeta.name}: ${googlePhotoUrl}`)
              return {
                ...destMeta,
                image: googlePhotoUrl || "/placeholder.svg", // Use placeholder if Google Photo fails
              }
            }),
          )
          console.log(
            "[TravelProvider] Initial destinations with images (after fetch):",
            initialDestinationsWithImages.map((d) => ({ id: d.id, name: d.name, image: d.image })),
          )
          setDestinations(initialDestinationsWithImages)
          console.log("[TravelProvider] Initial destinations with Google Place photos loaded.")
        }

        const cachedLiked = localStorage.getItem(CACHE_KEYS.LIKED)
        const cachedSaved = localStorage.getItem(CACHE_KEYS.SAVED)
        const cachedSwipeCount = localStorage.getItem(CACHE_KEYS.SWIPE_COUNT)
        const cachedActiveFilters = localStorage.getItem(CACHE_KEYS.ACTIVE_FILTERS) // New active filters

        // NEW: Load custom profiles and current profile ID
        const cachedCustomProfiles = localStorage.getItem(CACHE_KEYS.CUSTOM_PROFILES)
        let loadedCustomProfiles: UserProfile[]
        let loadedCurrentProfileId: string

        if (cachedCustomProfiles) {
          loadedCustomProfiles = JSON.parse(cachedCustomProfiles)
          loadedCurrentProfileId =
            localStorage.getItem(CACHE_KEYS.CURRENT_PROFILE_ID) ||
            loadedCustomProfiles[0]?.id ||
            INITIAL_DEV_PROFILES[0].id
        } else {
          // If no cached profiles, use the initial dev profiles
          loadedCustomProfiles = INITIAL_DEV_PROFILES
          loadedCurrentProfileId = INITIAL_DEV_PROFILES[0].id
        }
        setCustomProfiles(loadedCustomProfiles)
        setCurrentProfileId(loadedCurrentProfileId)

        setLikedDestinations(cachedLiked ? JSON.parse(cachedLiked) : [])
        setSavedDestinations(cachedSaved ? JSON.parse(cachedSaved) : [])

        setSwipeCount(cachedSwipeCount ? Number.parseInt(cachedSwipeCount) : 0)

        // Load active filters, ensuring all fields are present
        const parsedActiveFilters = cachedActiveFilters ? JSON.parse(cachedActiveFilters) : {}
        setActiveFiltersState({
          ...INITIAL_ACTIVE_FILTERS,
          ...parsedActiveFilters,
          locations: parsedActiveFilters.locations || [],
          genders: parsedActiveFilters.genders || [],
          races: parsedActiveFilters.races || [],
          religions: parsedActiveFilters.religions || [],
          placeTypes: parsedActiveFilters.placeTypes || [],
          maxDistance: parsedActiveFilters.maxDistance || 50,
        })

        // NEW: Load matched users, accepted/rejected user IDs
        const cachedMatchedUsers = localStorage.getItem(CACHE_KEYS.MATCHED_USERS)
        const cachedAcceptedUserIds = localStorage.getItem(CACHE_KEYS.ACCEPTED_USER_IDS)
        const cachedRejectedUserIds = localStorage.getItem(CACHE_KEYS.REJECTED_USER_IDS)

        setMatchedUsers(cachedMatchedUsers ? JSON.parse(cachedMatchedUsers) : [])
        setAcceptedUserIds(new Set(cachedAcceptedUserIds ? JSON.parse(cachedAcceptedUserIds) : []))
        setRejectedUserIds(new Set(cachedRejectedUserIds ? JSON.parse(cachedRejectedUserIds) : []))
      } catch (error) {
        console.error("[TravelProvider] Error loading from cache or fetching initial images:", error)
        // Fallback to empty data if anything goes wrong
        setDestinations([])
        setCustomProfiles(INITIAL_DEV_PROFILES) // Reset custom profiles to dev profiles
        setCurrentProfileId(INITIAL_DEV_PROFILES[0].id) // Reset current profile ID to first dev profile
        setActiveFiltersState(INITIAL_ACTIVE_FILTERS)
        setGenerationError("Failed to load initial data. Please check your network and API keys.")
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Save to cache whenever data changes
  useEffect(() => {
    console.log("[TravelProvider] useEffect for saving to cache triggered. isLoading:", isLoading)
    if (!isLoading) {
      saveToCache()
    }
  }, [
    destinations,
    likedDestinations,
    savedDestinations,
    swipeCount,
    customProfiles, // NEW: Add customProfiles to dependencies
    currentProfileId, // NEW: Add currentProfileId to dependencies
    activeFilters,
    matchedUsers, // NEW
    acceptedUserIds, // NEW
    rejectedUserIds, // NEW
    isLoading,
  ]) // Added activeFilters to dependencies

  const saveToCache = () => {
    console.log("[TravelProvider] Attempting to save to cache...")
    try {
      localStorage.setItem(CACHE_KEYS.DESTINATIONS, JSON.stringify(destinations))
      console.log("[TravelProvider] Destinations saved to cache.")
      localStorage.setItem(CACHE_KEYS.LIKED, JSON.stringify(likedDestinations))
      console.log("[TravelProvider] Liked destinations saved to cache.")
      localStorage.setItem(CACHE_KEYS.SAVED, JSON.stringify(savedDestinations))
      console.log("[TravelProvider] Saved destinations saved to cache.")
    } catch (error) {
      console.error("[TravelProvider] Error saving main data to cache:", error)
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.error("[TravelProvider] LocalStorage Quota Exceeded! Data might be too large.")
      }
    }
    // Save filters, swipe count, user profile, and active filters separately to avoid issues with large data
    try {
      localStorage.setItem(CACHE_KEYS.SWIPE_COUNT, swipeCount.toString())
      console.log("[TravelProvider] Swipe count saved to cache.")
      localStorage.setItem(CACHE_KEYS.ACTIVE_FILTERS, JSON.stringify(activeFilters))
      console.log("[TravelProvider] Active filters saved to cache.")
      localStorage.setItem(CACHE_KEYS.CUSTOM_PROFILES, JSON.stringify(customProfiles)) // NEW
      console.log("[TravelProvider] Custom profiles saved to cache.")
      localStorage.setItem(CACHE_KEYS.CURRENT_PROFILE_ID, currentProfileId) // NEW
      console.log("[TravelProvider] Current profile ID saved to cache.")
      localStorage.setItem(CACHE_KEYS.MATCHED_USERS, JSON.stringify(matchedUsers)) // NEW
      console.log("[TravelProvider] Matched users saved to cache.")
      localStorage.setItem(CACHE_KEYS.ACCEPTED_USER_IDS, JSON.stringify(Array.from(acceptedUserIds))) // NEW
      console.log("[TravelProvider] Accepted user IDs saved to cache.")
      localStorage.setItem(CACHE_KEYS.REJECTED_USER_IDS, JSON.stringify(Array.from(rejectedUserIds))) // NEW
      console.log("[TravelProvider] Rejected user IDs saved to cache.")
    } catch (error) {
      console.error("[TravelProvider] Error saving auxiliary data to cache:", error)
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        console.error("[TravelProvider] LocalStorage Quota Exceeded! Auxiliary data might be too large.")
      }
    }
  }

  // Check if we can generate (rate limiting)
  const canGenerate = useCallback((): boolean => {
    const lastGeneration = localStorage.getItem(CACHE_KEYS.LAST_GENERATION)
    if (!lastGeneration) return true

    const timeSinceLastGeneration = Date.now() - Number.parseInt(lastGeneration)
    const minInterval = 15000 // 15 seconds minimum between generations

    const can = timeSinceLastGeneration > minInterval
    console.log(`[TravelContext] canGenerate: ${can} (Time since last: ${timeSinceLastGeneration / 1000}s)`)
    return can
  }, [])

  const incrementSwipeCount = useCallback(() => {
    setSwipeCount((prev) => prev + 1)
  }, [])

  const likeDestination = useCallback((destination: Destination) => {
    setLikedDestinations((prev) => {
      if (prev.find((d) => d.id === destination.id)) return prev
      return [...prev, destination]
    })
  }, [])

  const saveDestination = useCallback((destination: Destination) => {
    setSavedDestinations((prev) => {
      if (prev.find((d) => d.id === destination.id)) return prev
      return [...prev, destination]
    })
  }, [])

  const dislikeDestination = useCallback((destination: Destination) => {
    // Remove from liked if it exists
    setLikedDestinations((prev) => prev.filter((d) => d.id !== destination.id))
  }, [])

  const generateNewDestinations = useCallback(
    async (filtersToUse?: ActiveFilters) => {
      // Use ActiveFilters type
      console.log("[TravelContext] Attempting to generate new destinations...")
      const currentFiltersForGeneration = filtersToUse || activeFilters // Use passed filters or current active filters
      console.log("[TravelContext] Filters for generation:", currentFiltersForGeneration) // Log filters

      // Check rate limiting
      if (!canGenerate()) {
        setGenerationError("Please wait 15 seconds between generations to avoid rate limits.")
        console.warn("[TravelContext] Generation blocked by rate limit.")
        return
      }

      setIsGenerating(true)
      setGenerationError(null)

      try {
        const existingNames = destinations.map((d) => d.name)
        const allIndianCities = [
          "Mumbai",
          "Delhi",
          "Bangalore",
          "Hyderabad",
          "Chennai",
          "Kolkata",
          "Pune",
          "Ahmedabad",
          "Goa",
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
        ]

        const locationFilters =
          currentFiltersForGeneration.locations.length > 0 ? currentFiltersForGeneration.locations : allIndianCities
        const categoryFilters =
          currentFiltersForGeneration.placeTypes.length > 0
            ? currentFiltersForGeneration.placeTypes
            : ["Cultural", "Scenic", "Historic", "Foodie", "Adventure", "Shopping", "Urban", "Beach"]

        console.log("🎯 Requesting AI to generate destinations for locations:", locationFilters)

        const result = await generateDestinationsAction({
          locations: locationFilters,
          categories: categoryFilters,
          existingNames,
        })

        console.log(
          `[TravelContext] AI generation result: success=${result.success}, destinations count=${result.destinations?.length}`,
        )

        if (result.success && result.destinations) {
          const aiGeneratedDestinations: Destination[] = await Promise.all(
            result.destinations.map(async (aiDest, index) => {
              console.log(
                `[TravelProvider] Calling getGooglePlacePhotoUrl for AI-generated: ${aiDest.name}, ${aiDest.location.city}`,
              )
              const googlePhotoUrl = await getGooglePlacePhotoUrl(aiDest.name, aiDest.location.city || "")
              console.log(
                `[TravelProvider] Received Google Photo URL for AI-generated ${aiDest.name}: ${googlePhotoUrl}`,
              )
              return {
                id: Math.floor(Math.random() * 10000) + 1000 + index,
                name: aiDest.name,
                description: aiDest.description,
                tags: aiDest.tags,
                location: aiDest.location,
                rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
                image: googlePhotoUrl || "/placeholder.svg", // Use Google Photo or placeholder
              }
            }),
          )
          console.log(
            "[TravelProvider] AI-generated destinations with images (after fetch):",
            aiGeneratedDestinations.map((d) => ({ id: d.id, name: d.name, image: d.image })),
          )

          if (aiGeneratedDestinations.length > 0) {
            setDestinations((prev) => {
              const newTotalDestinations = [...prev, ...aiGeneratedDestinations]
              console.log(`[TravelContext] Total destinations after adding new: ${newTotalDestinations.length}`)
              return newTotalDestinations
            })
            localStorage.setItem(CACHE_KEYS.LAST_GENERATION, Date.now().toString())
            console.log(
              `✅ Generated ${aiGeneratedDestinations.length} new destinations for ${locationFilters.join(", ")}`,
            )
          } else {
            console.warn("[TravelContext] AI generation returned no new unique destinations.")
            setGenerationError("AI generated no new unique destinations for the current filters.")
          }
        } else {
          throw new Error(result.error || "Unknown error during AI generation.")
        }
      } catch (error: any) {
        console.error("[TravelContext] Error generating destinations:", error)

        if (error.message.includes("Invalid API key")) {
          setGenerationError("Invalid API key. Please check your Mistral AI API key in the environment variables.")
        } else if (error.message.includes("Rate limit")) {
          setGenerationError("Rate limit exceeded. Please wait a few minutes before generating more destinations.")
        } else {
          setGenerationError("Failed to generate destinations. Please try again.")
        }
      } finally {
        setIsGenerating(false)
      }
    },
    [destinations, activeFilters, canGenerate],
  )

  const getPersonalizedRecommendations = useCallback(async (): Promise<string> => {
    try {
      const likedNames = likedDestinations.map((d) => d.name)
      const allTags = [...likedDestinations, ...savedDestinations].flatMap((d) => d.tags)
      const uniqueTags = [...new Set(allTags)]

      const result = await getRecommendationsAction({
        likedDestinations: likedNames,
        categories: uniqueTags,
      })

      if (result.success && result.recommendations) {
        return result.recommendations
      } else {
        throw new Error(result.error || "Unknown error getting recommendations.")
      }
    } catch (error) {
      console.error("Error getting recommendations:", error)
      return "Based on your preferences, I recommend exploring more cultural sites and trying local food experiences!"
    }
  }, [likedDestinations, savedDestinations])

  const clearCache = useCallback(() => {
    console.log("[TravelProvider] Clearing all cache data...")
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
      console.log(`[TravelProvider] Removed key: ${key}`)
    })

    // Reset to initial state
    setDestinations([])
    setLikedDestinations([])
    setSavedDestinations([])
    setSwipeCount(0)
    setCustomProfiles(INITIAL_DEV_PROFILES) // Reset custom profiles to dev profiles
    setCurrentProfileId(INITIAL_DEV_PROFILES[0].id) // Reset current profile ID to first dev profile
    setActiveFiltersState(INITIAL_ACTIVE_FILTERS) // Reset active filters
    setGenerationError(null)
    setMatchedUsers([]) // NEW
    setAcceptedUserIds(new Set()) // NEW
    setRejectedUserIds(new Set()) // NEW
    console.log("[TravelProvider] Cache cleared and state reset.")
  }, [])

  // NEW: Functions to manage custom profiles
  const addOrUpdateCustomProfile = useCallback((profile: UserProfile) => {
    setCustomProfiles((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === profile.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = profile
        return updated
      } else {
        return [...prev, profile]
      }
    })
  }, [])

  const selectProfile = useCallback((profileId: string) => {
    setCurrentProfileId(profileId)
  }, [])

  const deleteProfile = useCallback(
    (profileId: string) => {
      setCustomProfiles((prev) => {
        const filtered = prev.filter((p) => p.id !== profileId)
        // If the deleted profile was the current one, select the first available or default
        if (currentProfileId === profileId) {
          const newCurrentId = filtered.length > 0 ? filtered[0].id : INITIAL_DEV_PROFILES[0].id // Fallback to first dev profile
          setCurrentProfileId(newCurrentId)
        }
        return filtered
      })
    },
    [currentProfileId],
  )

  // Modified updateUserProfile to update the currently selected profile in customProfiles
  const updateUserProfile = useCallback(
    (profile: Partial<UserProfile>) => {
      setCustomProfiles((prev) => prev.map((p) => (p.id === currentProfileId ? { ...p, ...profile } : p)))
    },
    [currentProfileId],
  )

  // NEW: Functions to accept/reject users
  const acceptUser = useCallback((userId: string) => {
    setAcceptedUserIds((prev) => new Set(prev).add(userId))
    setRejectedUserIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(userId) // Remove from rejected if it was there
      return newSet
    })
  }, [])

  const rejectUser = useCallback((userId: string) => {
    setRejectedUserIds((prev) => new Set(prev).add(userId))
    setAcceptedUserIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(userId) // Remove from accepted if it was there
      return newSet
    })
  }, [])

  const value = {
    destinations,
    likedDestinations,
    savedDestinations,
    isLoading,
    isGenerating,
    generationError,
    swipeCount,
    userProfile, // This is now the derived active profile
    customProfiles, // NEW
    currentProfileId, // NEW
    activeFilters, // Expose activeFilters
    matchedUsers, // NEW
    acceptedUserIds, // NEW
    rejectedUserIds, // NEW
    likeDestination,
    saveDestination,
    dislikeDestination,
    generateNewDestinations,
    getPersonalizedRecommendations,
    clearCache,
    incrementSwipeCount,
    updateUserProfile,
    setActiveFilters: setActiveFiltersState, // Expose setActiveFilters
    addOrUpdateCustomProfile, // NEW
    selectProfile, // NEW
    deleteProfile, // NEW
    acceptUser, // NEW
    rejectUser, // NEW
  }

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
}

// Hook to use the travel context
export function useTravelContext() {
  const context = useContext(TravelContext)
  if (context === undefined) {
    throw new Error("useTravelContext must be used within a TravelProvider")
  }
  return context
}
