import { ReactNode } from "react"

export default function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white border p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="text-emerald-600">{icon}</div>
      </div>
    </div>
  )
}
