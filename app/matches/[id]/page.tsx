"use client"

import { useParams, useRouter } from "next/navigation"
import { useTravelContext } from "@/context/travel-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Sparkles, ArrowLeft, MessageCircle, Heart, X } from "lucide-react"
import { mockUsers } from "@/components/user-matches"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SmartImage } from "@/components/smart-image" // Import SmartImage

export default function MatchedUserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params as { id: string }

  const { likedDestinations, savedDestinations, acceptUser, rejectUser, acceptedUserIds, rejectedUserIds } =
    useTravelContext()

  const matchedUser = mockUsers.find((user) => user.id === id)

  if (!matchedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-gray-600 mb-6">The profile you are looking for does not exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const userLikedIds = likedDestinations.map((d) => d.id)
  const userSavedIds = savedDestinations.map((d) => d.id)

  const getDestinationName = (destId: number) => {
    const allDestinations = [...likedDestinations, ...savedDestinations]
    const destination = allDestinations.find((d) => d.id === destId)
    return destination ? destination.name : `Destination ${destId}`
  }

  const commonDestinations = [...(matchedUser.liked || []), ...(matchedUser.saved || [])].filter(
    (destId) => userLikedIds.includes(destId) || userSavedIds.includes(destId),
  )

  const hasAccepted = acceptedUserIds.has(matchedUser.id)
  const hasRejected = rejectedUserIds.has(matchedUser.id)

  const handleYex = () => {
    acceptUser(matchedUser.id)
  }

  const handleNex = () => {
    rejectUser(matchedUser.id)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Matched Profile</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-center pb-4">
          <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-primary">
            <SmartImage // Using SmartImage here
              src={matchedUser.profilePic || "/placeholder.svg"}
              alt={matchedUser.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold">
              {matchedUser.name}, {matchedUser.age}
            </h2>
            <p className="text-md text-gray-600 flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" />
              {matchedUser.location}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Dump Section - Now Scrollable */}
          {matchedUser.photoDump && matchedUser.photoDump.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Photo Dump</h3>
              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="flex w-max space-x-4 p-4">
                  {matchedUser.photoDump.map((photoUrl, index) => (
                    <div key={`photo-${index}`} className="relative h-48 w-64 flex-shrink-0 rounded-md overflow-hidden">
                      <SmartImage // Using SmartImage here
                        src={photoUrl || "/placeholder.svg"}
                        alt={`${matchedUser.name}'s photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-2">Bio</h3>
            <p className="text-gray-700">{matchedUser.bio}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {matchedUser.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {commonDestinations.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Common Destinations</h3>
              <div className="flex flex-wrap gap-2">
                {commonDestinations.map((destId) => (
                  <Badge key={destId} variant="default">
                    {getDestinationName(destId)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={handleNex} disabled={hasRejected} className="flex-1 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              {hasRejected ? "Nex'd" : "Nex"}
            </Button>
            <Button
              onClick={handleYex}
              disabled={hasAccepted}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Heart className="h-4 w-4 mr-2" />
              {hasAccepted ? "Yex'd" : "Yex"}
            </Button>
          </div>

          <Button className="w-full flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300">
            <MessageCircle className="h-5 w-5" />
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
