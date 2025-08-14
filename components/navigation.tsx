"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, User } from "lucide-react"
import { useTravelContext } from "@/context/travel-context"

export function Navigation() {
  const pathname = usePathname()
  const { savedDestinations, likedDestinations } = useTravelContext()

  const navItems = [
    {
      name: "Discover",
      href: "/",
      icon: Home,
      count: 0,
    },
    {
      name: "Saved",
      href: "/saved",
      icon: Heart,
      count: savedDestinations.length + likedDestinations.length,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      count: 0,
    },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
                {item.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
