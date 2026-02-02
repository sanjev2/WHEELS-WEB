"use client"

import Link from "next/link"

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Admin / Users (Dummy Table)</h1>

      <Link href="/admin/user/create" className="inline-block px-4 py-2 rounded bg-blue-600 text-white">
        Create User
      </Link>

      <div className="border rounded">
        <div className="grid grid-cols-4 gap-2 p-3 font-semibold bg-gray-50">
          <div>Name</div><div>Email</div><div>Role</div><div>Actions</div>
        </div>

        {/* Dummy rows */}
        {["111", "222", "333"].map((id) => (
          <div key={id} className="grid grid-cols-4 gap-2 p-3 border-t">
            <div>Dummy {id}</div>
            <div>dummy{id}@mail.com</div>
            <div>user</div>
            <div className="flex gap-2">
              <Link className="text-blue-600 underline" href={`/admin/user/${id}`}>View</Link>
              <Link className="text-emerald-600 underline" href={`/admin/user/${id}/edit`}>Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
