"use server"

import { mistralClient } from "@/lib/mistral-client"
import { put } from "@vercel/blob" // Import put from Vercel Blob

/* ------------------------------------------------------------------ */
/* 1️⃣  Destination generation                                         */
/* ------------------------------------------------------------------ */
export async function generateDestinationsAction(filters: {
  locations: string[]
  categories: string[]
  existingNames: string[]
}) {
  console.log("[Server Action] generateDestinationsAction invoked.")
  try {
    const aiDestinations = await mistralClient.generateMultipleDestinations(filters, 8)
    return { success: true, destinations: aiDestinations }
  } catch (error: any) {
    console.error("Error in generateDestinationsAction:", error)
    return { success: false, error: error.message || "Failed to generate destinations" }
  }
}

/* ------------------------------------------------------------------ */
/* 2️⃣  AI recommendations                                             */
/* ------------------------------------------------------------------ */
export async function getRecommendationsAction(data: {
  likedDestinations: string[]
  categories: string[]
}) {
  try {
    const recommendations = await mistralClient.generateTravelRecommendations(data)
    return { success: true, recommendations }
  } catch (error: any) {
    console.error("Error in getRecommendationsAction:", error)
    return { success: false, error: error.message || "Failed to get recommendations" }
  }
}

/* ------------------------------------------------------------------ */
/* 3️⃣  Google Places Photo helper                                    */
/* ------------------------------------------------------------------ */
export async function getGooglePlacePhotoUrl(placeName: string, city: string): Promise<string | null> {
  console.log(`[Google Places API] ➡️  Looking up "${placeName}, ${city}"`)

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  console.log(`[Google Places API] 🔑 API Key present: ${!!apiKey} (starts with: ${apiKey?.substring(0, 5)}...)`)
  if (!apiKey) {
    console.warn("[Google Places API] Missing GOOGLE_PLACES_API_KEY")
    return null
  }

  /* -------- Text Search: find place_id & photo_reference ---------- */
  const query = `${placeName}, ${city}, India`
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query,
  )}&key=${apiKey}`

  console.log(`[Google Places API] 🔍 Text search URL: ${searchUrl}`)

  try {
    // Add a User-Agent header and a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5-second timeout

    const searchResp = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId) // Clear the timeout if fetch completes in time

    if (!searchResp.ok) {
      console.error("[Google Places API] Text-search HTTP error:", searchResp.status, searchResp.statusText)
      const errorBody = await searchResp.text()
      console.error("[Google Places API] Text-search HTTP error body:", errorBody) // Log the raw error body
      return null
    }
    const searchData = await searchResp.json()
    if (searchData.status !== "OK" || !searchData.results?.length) {
      console.error(
        "[Google Places API] Text-search API error:",
        searchData.status,
        searchData.error_message || "No results",
      )
      console.error("[Google Places API] Text-search full response data:", JSON.stringify(searchData, null, 2)) // Log full response
      return null
    }

    const photoRef = searchData.results[0].photos?.[0]?.photo_reference
    if (!photoRef) {
      console.log("[Google Places API] No photos in first result for:", placeName)
      return null
    }

    // Build the final photo URL to point to our proxy API route
    const proxyPhotoUrl = `/api/image-proxy?photoReference=${photoRef}&maxWidth=4000`

    console.log(`[Google Places API] ✅ Returning proxy URL for "${placeName}" → ${proxyPhotoUrl}`)
    console.log(`[Google Places API] FINAL RETURN VALUE for "${placeName}": ${proxyPhotoUrl}`)
    return proxyPhotoUrl
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error(`[Google Places API] Fetch for "${placeName}" timed out.`, error.message)
    } else {
      console.error(`[Google Places API] Error in main try-catch for "${placeName}":`, error.message)
    }
    return null
  }
}

/* ------------------------------------------------------------------ */
/* 4️⃣  Profile Image Upload                                          */
/* ------------------------------------------------------------------ */
export async function uploadProfileImageAction(formData: FormData) {
  console.log("[Server Action] uploadProfileImageAction invoked.")
  const file = formData.get("file") as File | null

  if (!file) {
    return { success: false, error: "No file provided." }
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files are allowed." }
  }

  try {
    // Upload the file to Vercel Blob storage
    const { url } = await put(file.name, file, { access: "public" })
    console.log(`[Server Action] Image uploaded successfully: ${url}`)
    return { success: true, url }
  } catch (error: any) {
    console.error("[Server Action] Error uploading image:", error)
    return { success: false, error: error.message || "Failed to upload image." }
  }
}
