"use client"

import { useState } from "react"
import { useTravelContext } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, RefreshCw, Sparkles, MessageCircle } from "lucide-react"

export default function SettingsPage() {
  const {
    destinations,
    likedDestinations,
    savedDestinations,
    clearCache,
    generateNewDestinations,
    getPersonalizedRecommendations,
    isLoading,
    isGenerating,
  } = useTravelContext()

  const [recommendations, setRecommendations] = useState<string>("")
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  const exportData = () => {
    const data = {
      destinations,
      likedDestinations,
      savedDestinations,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "travel-data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const getRecommendations = async () => {
    if (likedDestinations.length === 0 && savedDestinations.length === 0) {
      setRecommendations("Start liking and saving destinations to get personalized AI recommendations!")
      return
    }

    setLoadingRecommendations(true)
    try {
      const aiRecommendations = await getPersonalizedRecommendations()
      setRecommendations(aiRecommendations)
    } catch (error) {
      setRecommendations("Sorry, I couldn't generate recommendations right now. Please try again later.")
    } finally {
      setLoadingRecommendations(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>App Statistics</CardTitle>
            <CardDescription>Your travel discovery stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{destinations.length}</div>
                <div className="text-sm text-gray-600">Total Destinations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{likedDestinations.length}</div>
                <div className="text-sm text-gray-600">Liked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{savedDestinations.length}</div>
                <div className="text-sm text-gray-600">Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI-Powered Features
            </CardTitle>
            <CardDescription>Get personalized recommendations using Mistral AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={getRecommendations}
              disabled={loadingRecommendations}
              className="w-full flex items-center gap-2"
            >
              {loadingRecommendations ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Getting AI Recommendations...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Get Personalized Recommendations
                </>
              )}
            </Button>

            {recommendations && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Recommendations
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendations}</p>
              </div>
            )}

            <Button onClick={() => generateNewDestinations()} disabled={isGenerating} className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "AI Generating Destinations..." : "Generate New Destinations with AI"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your app data and cache</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={clearCache} variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Travel Swipe App Information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Version:</strong> 1.0.0
              </p>
              <p>
                <strong>AI Provider:</strong> Mistral AI
              </p>
              <p>
                <strong>Cache Storage:</strong> Browser LocalStorage
              </p>
              <p>
                <strong>Data Persistence:</strong> Automatic
              </p>
              <p className="text-gray-600 mt-4">
                This app uses Mistral AI to generate personalized travel destinations and recommendations. All your data
                is stored locally in your browser and automatically cached.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
