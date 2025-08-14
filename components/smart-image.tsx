"use client"

import Image, { type ImageProps } from "next/image"
import { useState, useEffect } from "react"

export function SmartImage({ src, alt, ...rest }: ImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Reset state if src prop changes (e.g., when a new destination card appears)
  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    console.log(`[SmartImage] Resetting for new src: ${src}, alt: ${alt}`)
  }, [src, alt])

  const handleError = () => {
    console.error(`[SmartImage] Error loading image for src: ${currentSrc}. Falling back to placeholder.`)
    setCurrentSrc("/placeholder.svg")
    setHasError(true)
  }

  return (
    <>
      <Image
        {...rest}
        src={currentSrc || "/placeholder.svg"}
        alt={alt}
        onError={handleError}
        unoptimized
        crossOrigin="anonymous" // Re-added crossOrigin="anonymous"
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-center text-sm p-2">
          Image failed to load.
        </div>
      )}
    </>
  )
}
