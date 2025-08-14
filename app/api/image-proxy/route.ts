import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const photoReference = searchParams.get("photoReference")
  const maxWidth = searchParams.get("maxWidth") || "1600" // Re-added default maxWidth

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!photoReference) {
    return new NextResponse("Missing photoReference parameter", { status: 400 })
  }
  if (!apiKey) {
    console.error("[Image Proxy] Missing GOOGLE_PLACES_API_KEY environment variable.")
    return new NextResponse("Server configuration error: API key missing", { status: 500 })
  }

  console.log(`[Image Proxy] 🔑 API Key present: ${!!apiKey} (starts with: ${apiKey?.substring(0, 5)}...)`)

  const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`

  console.log(`[Image Proxy] 🖼️ Fetching from Google Photo URL: ${googlePhotoUrl}`)

  try {
    const response = await fetch(googlePhotoUrl)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(
        `[Image Proxy] Failed to fetch image from Google: ${response.status} ${response.statusText}. Body: ${errorBody}`,
      )
      return new NextResponse(`Failed to fetch image from Google: ${response.statusText}`, { status: response.status })
    }

    // Get content type from Google's response
    const contentType = response.headers.get("Content-Type") || "application/octet-stream"

    // Return the image directly
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*", // Allow all origins for now
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for a long time
      },
    })
  } catch (error) {
    console.error("[Image Proxy] Error fetching image:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
