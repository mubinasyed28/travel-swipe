export type Destination = {
  id: number
  name: string
  image: string
  description: string
  rating: number
  tags: string[]
  recommendedFor?: string[] // Added for gender-based filtering
  score?: number
  location?: {
    city?: string
    country: string
  }
}

export type SwipeAction = {
  destinationId: number
  action: "like" | "dislike" | "save"
  index: number
}
