"use client"

import type React from "react"

import { useState, useRef } from "react" // Import useRef
import { useTravelContext, type UserProfile } from "@/context/travel-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Sparkles, Save, X, User, CheckCircle2, Loader2 } from "lucide-react" // Import Loader2
import { CategorySearch } from "@/components/category-search"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSearchSelect } from "@/components/multi-search-select"
import { uploadProfileImageAction } from "@/app/actions" // Import the new server action
import { useToast } from "@/components/ui/use-toast" // Import useToast

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"]
const RACE_OPTIONS = [
  "Asian",
  "Black",
  "White",
  "Hispanic or Latino",
  "Indigenous",
  "Middle Eastern or North African",
  "Other",
]
const RELIGION_OPTIONS = [
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Sikhism",
  "Judaism",
  "Atheism",
  "Agnosticism",
  "Spiritual but not religious",
  "Other",
]

export default function ProfilePage() {
  const {
    userProfile, // This is the currently active profile
    customProfiles, // All profiles
    currentProfileId, // ID of the active profile
    updateUserProfile,
    addOrUpdateCustomProfile, // Still useful if you want to programmatically add profiles later
    selectProfile,
    deleteProfile,
  } = useTravelContext()

  const { toast } = useToast() // Initialize useToast

  const [isEditingCurrentProfile, setIsEditingCurrentProfile] = useState(false)
  const [editableCurrentProfile, setEditableCurrentProfile] = useState<UserProfile>(userProfile)
  const [isUploadingImage, setIsUploadingImage] = useState(false) // New state for image upload loading
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref for the hidden file input

  // Update editableCurrentProfile when userProfile changes (e.g., when a new profile is selected)
  // This ensures the form always reflects the currently active profile
  useState(() => {
    setEditableCurrentProfile(userProfile)
  }, [userProfile])

  const handleSaveCurrentProfile = () => {
    updateUserProfile(editableCurrentProfile)
    setIsEditingCurrentProfile(false)
    toast({
      title: "Profile Saved!",
      description: "Your profile changes have been successfully saved.",
      variant: "default",
    })
  }

  const handleCancelEditCurrentProfile = () => {
    setEditableCurrentProfile(userProfile) // Revert changes
    setIsEditingCurrentProfile(false)
    toast({
      title: "Edit Cancelled",
      description: "Your profile changes were discarded.",
      variant: "default",
    })
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const result = await uploadProfileImageAction(formData)
      if (result.success && result.url) {
        setEditableCurrentProfile((prev) => ({ ...prev, profilePic: result.url }))
        toast({
          title: "Image Uploaded!",
          description: "Your new profile picture has been saved.",
          variant: "default",
        })
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Could not upload image. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during image upload.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
      // Clear the file input value to allow re-uploading the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Profiles</h1>

      {/* Section for managing all profiles */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Select Your Profile
          </CardTitle>
          <CardDescription>Choose which team member's profile to use for testing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customProfiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.profilePic || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profile.id === currentProfileId ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => selectProfile(profile.id)}>
                    Select
                  </Button>
                )}
                {/* Removed delete button as profiles are pre-defined for dev team */}
              </div>
            </div>
          ))}
          {/* Removed "Add New Profile" button and form */}
        </CardContent>
      </Card>

      {/* Section for editing the currently active profile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>
            Editing: <span className="text-blue-600">{userProfile.name}</span>
          </CardTitle>
          {!isEditingCurrentProfile ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingCurrentProfile(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEditCurrentProfile}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveCurrentProfile} disabled={isUploadingImage}>
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage
                  src={editableCurrentProfile.profilePic || "/placeholder.svg"}
                  alt={editableCurrentProfile.name}
                />
                <AvatarFallback>{editableCurrentProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {isEditingCurrentProfile && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                </>
              )}
            </div>
            <div className="text-center">
              {isEditingCurrentProfile ? (
                <Input
                  value={editableCurrentProfile.name}
                  onChange={(e) => setEditableCurrentProfile({ ...editableCurrentProfile, name: e.target.value })}
                  className="text-xl font-bold text-center"
                />
              ) : (
                <h2 className="text-xl font-bold">{userProfile.name}</h2>
              )}
              {isEditingCurrentProfile ? (
                <Input
                  type="number"
                  value={editableCurrentProfile.age}
                  onChange={(e) =>
                    setEditableCurrentProfile({ ...editableCurrentProfile, age: Number.parseInt(e.target.value) || 0 })
                  }
                  className="text-sm text-gray-600 text-center mt-1"
                />
              ) : (
                <p className="text-sm text-gray-600">{userProfile.age} years old</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              {isEditingCurrentProfile ? (
                <Input
                  id="location"
                  value={editableCurrentProfile.location}
                  onChange={(e) => setEditableCurrentProfile({ ...editableCurrentProfile, location: e.target.value })}
                />
              ) : (
                <div className="flex items-center text-gray-700 mt-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{userProfile.location}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditingCurrentProfile ? (
                <Textarea
                  id="bio"
                  value={editableCurrentProfile.bio}
                  onChange={(e) => setEditableCurrentProfile({ ...editableCurrentProfile, bio: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 mt-1">{userProfile.bio}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              {isEditingCurrentProfile ? (
                <Select
                  onValueChange={(value) => setEditableCurrentProfile({ ...editableCurrentProfile, gender: value })}
                  value={editableCurrentProfile.gender}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700 mt-1">{userProfile.gender}</p>
              )}
            </div>

            <div>
              <MultiSearchSelect
                label="Race/Ethnicity"
                options={RACE_OPTIONS}
                selectedItems={editableCurrentProfile.race}
                onItemsChange={(newRaces) => setEditableCurrentProfile({ ...editableCurrentProfile, race: newRaces })}
                placeholder="Add your race/ethnicity..."
                allowCustom={true}
              />
            </div>

            <div>
              <MultiSearchSelect
                label="Religion"
                options={RELIGION_OPTIONS}
                selectedItems={editableCurrentProfile.religion}
                onItemsChange={(newReligions) =>
                  setEditableCurrentProfile({ ...editableCurrentProfile, religion: newReligions })
                }
                placeholder="Add your religion..."
                allowCustom={true}
              />
            </div>

            <div>
              <Label>Interests</Label>
              {isEditingCurrentProfile ? (
                <CategorySearch
                  selectedCategories={editableCurrentProfile.interests}
                  onCategoriesChange={(newCategories) =>
                    setEditableCurrentProfile({ ...editableCurrentProfile, interests: newCategories })
                  }
                  placeholder="Add your interests..."
                />
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {userProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
