"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, User, ShoppingCart, Car, ClipboardList, Settings, LogOut } from "lucide-react"
import "../styles/dashboard.css"

export default function Dashboard() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/auth/login")
  }

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
    { icon: User, label: "User Profile", href: "/dashboard/profile" },
    { icon: ShoppingCart, label: "Services", href: "/dashboard/services" },
    { icon: Car, label: "Vehicle Portfolio", href: "/dashboard/vehicles" },
    { icon: ClipboardList, label: "My Orders", href: "/dashboard/orders" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ]

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Wheels</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href} className={`nav-item ${item.active ? "nav-item-active" : ""}`}>
              <div className="nav-icon-wrapper">
                <item.icon className="nav-icon" />
              </div>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <h2 className="dashboard-title">Welcome to Dashboard</h2>
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="logout-icon" />
            <span>Log out</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          <button className="add-service-button">
            <span className="plus-icon">+</span>
            Add Service
          </button>
        </div>
      </main>
    </div>
  )
}
