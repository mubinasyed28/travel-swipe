"use client"

import { motion } from "framer-motion"
import { User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SmartImage } from "@/components/smart-image" // Import SmartImage
import Link from "next/link"
import { useTravelContext } from "@/context/travel-context"

interface MatchPopupProps {
  onClose: () => void
  matchedUser: {
    id: string
    name: string
    age: number
    profilePic: string
    location: string
    bio: string
    commonDestinations: number
  }
}

export function MatchPopup({ onClose, matchedUser }: MatchPopupProps) {
  const { acceptUser, rejectUser } = useTravelContext()

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-sm overflow-hidden bg-white shadow-2xl">
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
            >
              <X size={18} />
            </Button>

            {/* Match header - Neutralized */}
            <div className="bg-blue-600 text-white p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", damping: 15 }}
              >
                <User className="h-12 w-12 mx-auto mb-2 fill-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-1">Match Found!</h2> {/* Changed text here */}
              <p className="text-blue-100">You both share similar travel interests</p>
            </div>

            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-200">
                  <SmartImage // Using SmartImage here
                    src={matchedUser.profilePic || "/placeholder.svg"}
                    alt={matchedUser.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <h3 className="text-xl font-bold mb-1">
                  {matchedUser.name}, {matchedUser.age}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{matchedUser.location}</p>

                <div className="bg-gray-100 rounded-lg p-3 mb-4 w-full">
                  <p className="text-sm text-gray-700 font-medium">
                    🎯 {matchedUser.commonDestinations} destinations in common
                  </p>
                </div>

                <p className="text-sm text-gray-700 mb-6 line-clamp-2">{matchedUser.bio}</p>

                <div className="flex gap-3 w-full">
                  <Link href={`/matches/${matchedUser.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
