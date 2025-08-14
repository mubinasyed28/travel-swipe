export class MistralClient {
  private apiKey: string
  private baseUrl = "https://api.mistral.ai/v1"
  private lastRequestTime = 0
  private minRequestInterval = 2000

  constructor(apiKey: string) {
    this.apiKey = apiKey
    if (!apiKey) {
      console.warn("No Mistral API key provided. AI generation will not work.")
    } else if (apiKey.startsWith("sk-")) {
      console.warn("API key appears to be OpenAI format. Mistral keys don't start with 'sk-'")
    } else {
      console.log("✅ Mistral API key loaded successfully:", apiKey.substring(0, 8) + "...")
    }
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
    this.lastRequestTime = Date.now()
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>, maxRetries = 2, baseDelay = 1000): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.waitForRateLimit()
        return await operation()
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries - 1
        if (error.message?.includes("429") && !isLastAttempt) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
          console.log(`Rate limit hit, retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
        if (isLastAttempt) throw error
      }
    }
    throw new Error("Max retries exceeded")
  }

  async generateMultipleDestinations(
    filters: {
      locations: string[]
      categories: string[]
      existingNames: string[]
    },
    count = 8,
  ): Promise<
    Array<{
      name: string
      description: string
      tags: string[]
      location: { city?: string; country: string }
    }>
  > {
    if (!this.apiKey) {
      throw new Error("No Mistral API key provided. Cannot generate destinations.")
    }

    try {
      return await this.retryWithBackoff(async () => {
        const prompt = this.createDestinationPrompt(filters, count)

        console.log("🚀 Making API request to Mistral AI...")

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "mistral-small",
            messages: [
              {
                role: "system",
                content:
                  "You are a travel expert. Return only a valid JSON array of travel destinations. No text or explanation outside the JSON. Ensure all destinations are in the specified locations only.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ Mistral API error:", response.status, errorText)

          if (response.status === 401) {
            throw new Error("INVALID_API_KEY")
          } else if (response.status === 429) {
            throw new Error("RATE_LIMIT")
          } else {
            throw new Error(`API_ERROR_${response.status}`)
          }
        }

        const data = await response.json()
        const content = data.choices[0].message.content

        console.log("✅ Received AI response, parsing destinations...")

        const parsedArray = this.safeJsonArrayParse(content)

        // ULTRA STRICT location filtering - only exact matches allowed
        const filteredArray = this.ultraStrictLocationFilter(parsedArray, filters.locations)

        console.log(`🎯 Generated ${filteredArray.length} destinations successfully`)

        return filteredArray.slice(0, count)
      })
    } catch (error: any) {
      console.error("❌ Error in generateMultipleDestinations:", error)
      throw error // Re-throw the error to be handled by the calling context
    }
  }

  // ULTRA STRICT location filtering - only exact city matches allowed
  private ultraStrictLocationFilter(destinations: any[], locationFilters: string[]): any[] {
    if (locationFilters.length === 0) return destinations

    const filtered = destinations.filter((dest) => {
      if (!dest.location || !dest.location.city) {
        console.log(`❌ Rejected destination "${dest.name}" - missing city information`)
        return false
      }

      const destCity = dest.location.city.trim()

      // Check if destination city exactly matches any of the filtered cities
      const isValidCity = locationFilters.some((filterCity) => {
        const exactMatch = destCity.toLowerCase() === filterCity.toLowerCase()
        return exactMatch
      })

      if (isValidCity) {
        console.log(`✅ Accepted destination "${dest.name}" in "${destCity}"`)
      }

      return isValidCity
    })

    console.log(
      `🎯 Ultra-strict filter: ${filtered.length}/${destinations.length} destinations passed for cities: ${locationFilters.join(", ")}`,
    )
    return filtered
  }

  async generateTravelRecommendations(data: {
    likedDestinations: string[]
    categories: string[]
  }): Promise<string> {
    if (!this.apiKey) {
      throw new Error("No Mistral API key provided. Cannot generate recommendations.")
    }

    const { likedDestinations, categories } = data
    try {
      return await this.retryWithBackoff(async () => {
        const prompt = `Based on these liked destinations: ${likedDestinations.join(", ")} and interests in ${categories.join(", ")}, provide 3-4 personalized travel recommendations. Keep it conversational and helpful.`

        console.log("🤖 Getting AI travel recommendations...")

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "mistral-small",
            messages: [
              {
                role: "system",
                content: "You are a helpful travel advisor. Provide personalized, friendly recommendations.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("INVALID_API_KEY")
          }
          throw new Error(`API_ERROR_${response.status}`)
        }

        const data = await response.json()
        console.log("✅ AI recommendations generated successfully")
        return data.choices[0].message.content
      })
    } catch (error: any) {
      console.error("❌ Error generating recommendations:", error)
      throw error // Re-throw the error to be handled by the calling context
    }
  }

  private createDestinationPrompt(
    filters: {
      locations: string[]
      categories: string[]
      existingNames: string[]
    },
    count: number,
  ): string {
    const locationList = filters.locations.length > 0 ? filters.locations.join(", ") : "Mumbai, Delhi, Goa, Bangalore"
    const categoryList = filters.categories.length > 0 ? filters.categories.join(", ") : "Cultural, Scenic, Historic"
    const existingList = filters.existingNames.length > 0 ? filters.existingNames.slice(-15).join(", ") : "None"

    return `Generate exactly ${count} unique travel destinations in JSON array format.

STRICT LOCATION CONSTRAINT: All generated destinations MUST be located ONLY within these EXACT cities: ${locationList}. The 'city' field in the JSON MUST precisely match one of these cities. DO NOT include destinations from any other cities, variations, or nearby areas.

CRITICAL UNIQUENESS REQUIREMENT - THIS IS MANDATORY:
- DO NOT generate any destinations with names that are already in this list (case-insensitive): ${existingList}
- Ensure each generated destination has a unique name.

Other requirements:
- Categories: Focus on ${categoryList}
- Descriptions should be 1-2 sentences, engaging and specific

Return ONLY a JSON array in this exact format:
[
{
  "name": "Specific Place Name",
  "description": "Engaging description of the place and what makes it special",
  "tags": ["tag1", "tag2", "tag3"],
  "location": {
    "city": "EXACT_CITY_FROM_LIST",
    "country": "India"
  }
}
]

FINAL CHECK: Every destination MUST be in one of these cities ONLY: ${locationList} AND MUST NOT be in the existing names list.`
  }

  private safeJsonArrayParse(content: string): any[] {
    // Try direct JSON parse
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed.map((d) => this.normalizeDestination(d)).filter(this.isValidDestination)
      }
    } catch {}

    // Try cleaning and parsing
    try {
      const cleaned = this.aggressiveCleanJson(content)
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        return parsed.map((d) => this.normalizeDestination(d)).filter(this.isValidDestination)
      }
    } catch {}

    console.error("❌ JSON parsing failed for content:", content)
    throw new Error("Failed to parse AI response as valid JSON array.")
  }

  private isValidDestination(dest: any): boolean {
    return (
      dest &&
      typeof dest.name === "string" &&
      dest.name.length > 0 &&
      typeof dest.description === "string" &&
      dest.description.length > 0 &&
      Array.isArray(dest.tags) &&
      dest.tags.length > 0 &&
      dest.location &&
      typeof dest.location.country === "string" &&
      dest.location.country.length > 0 &&
      typeof dest.location.city === "string" &&
      dest.location.city.length > 0
    )
  }

  private normalizeDestination(dest: any) {
    return {
      name: String(dest.name || "Unnamed Place").trim(),
      description: String(dest.description || "A wonderful place to visit").trim(),
      tags: Array.isArray(dest.tags) ? dest.tags.slice(0, 3) : ["Cultural", "Local"],
      location: {
        city: dest.location?.city ? String(dest.location.city).trim() : undefined,
        country: String(dest.location?.country || "India").trim(),
      },
    }
  }

  private aggressiveCleanJson(content: string): string {
    let cleaned = content.trim()

    // Remove common prefixes and suffixes
    const patterns = [/^```json\s*/i, /^```/, /```$/g, /^Here.*?:\s*/i, /^The.*?:\s*/i]

    patterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "")
    })

    // Find array boundaries
    const firstBrace = cleaned.indexOf("[")
    const lastBrace = cleaned.lastIndexOf("]")

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }

    // Fix common JSON issues
    cleaned = cleaned.replace(/,(\s*[\]}])/g, "$1") // Remove trailing commas

    return cleaned
  }
}

// Get API key from environment variables
function getApiKey(): string {
  // Use the environment variable that's now properly set in Vercel
  // This function is now only called on the server where MISTRAL_API_KEY is available
  return process.env.MISTRAL_API_KEY || ""
}

// Create and export singleton instance
// This instance will only be used in server actions, not directly in client components
export const mistralClient = new MistralClient(getApiKey())
