"use client"

import UpdateProfile from "@/app/user/components/UpdateProfile"

export default function UserProfilePage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Update Profile</h1>
      <UpdateProfile />
    </div>
  )
}
