    "use client"

    import { useState, useEffect } from "react"
    import { useRouter } from "next/navigation"
    import Link from "next/link"
    import {
    Menu,
    X,
    ChevronRight,
    Wrench,
    Zap,
    Smartphone,
    CarFrontIcon,
    } from "lucide-react"
    import "@/app/styles/landing.css"

    export default function Landing() {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
        setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToSection = (id: string) => {
        setIsMenuOpen(false)
        const element = document.getElementById(id)
        if (element) {
        element.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <div className="landing-container">
        {/* Header - Sticky and Scrollable */}
        <header className={`landing-header ${isScrolled ? "scrolled" : ""}`}>
            <nav className="landing-nav">
            {/* Logo */}
            <div className="landing-logo">
                <Wrench className="logo-icon" />
                <span className="logo-text">WHEELS</span>
            </div>

            {/* Desktop Navigation */}
            <div className="landing-nav-desktop">
                <button onClick={() => scrollToSection("services")} className="nav-link">
                Services
                </button>
                <button onClick={() => scrollToSection("about")} className="nav-link">
                About
                </button>
                <button onClick={() => scrollToSection("download")} className="nav-link">
                Download
                </button>
            </div>

            {/* CTA and Mobile Menu */}
            <div className="landing-header-cta">
                <Link href="/auth/login" className="btn-book-desktop">
                Book Now
                </Link>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="btn-mobile-menu">
                {isMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
                </button>
            </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
            <div className="landing-mobile-menu">
                <button onClick={() => scrollToSection("services")} className="mobile-menu-link">
                Services
                </button>
                <button onClick={() => scrollToSection("about")} className="mobile-menu-link">
                About
                </button>
                <button onClick={() => scrollToSection("download")} className="mobile-menu-link">
                Download
                </button>
                <Link href="/auth/login" className="btn-book-mobile">
                Book Now
                </Link>
            </div>
            )}
        </header>

        {/* Hero Section */}
        <section className="landing-hero">
            <div className="hero-decoration hero-deco-1"></div>
            <div className="hero-decoration hero-deco-2"></div>

            <div className="hero-content">
            <h1 className="hero-title">
                Your Trusted <span className="hero-highlight">Car Service</span> Partner
            </h1>
            <p className="hero-subtitle">
                Professional car servicing, maintenance, and emergency assistance. Available 24/7 for all your automotive
                needs in Nepal.
            </p>

            <div className="hero-buttons">
                <Link href="/auth/login" className="btn-primary">
                Book Now <ChevronRight className="btn-icon" />
                </Link>
                <button onClick={() => scrollToSection("services")} className="btn-secondary">
                Learn More <ChevronRight className="btn-icon" />
                </button>
            </div>
            </div>
        </section>

        {/* Services Section */}
        <section id="services" className="landing-services">
            <div className="services-container">
            <div className="services-header">
                <h2 className="services-title">
                <Link href="/auth/login" className="section-title-link">
                    Our Services
                </Link>
                </h2>
                <p className="services-subtitle">Complete automotive solutions tailored to your needs</p>
            </div>

            <div className="services-grid">
                {[
                {
                    icon: Wrench,
                    title: "Basic Servicing",
                    desc: "Oil changes, filter replacements, and routine maintenance",
                },
                { icon: Zap, title: "Comprehensive", desc: "Full diagnostics and complete vehicle servicing" },
                { icon: CarFrontIcon, title: "Routine Maintenance", desc: "Keep your car running smoothly" },
                { icon: Smartphone, title: "Custom Solutions", desc: "Specialized services for your specific needs" },
                ].map((service, idx) => (
                <Link key={idx} href="/auth/login" className="service-card">
                    <service.icon className="service-icon" />
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-desc">{service.desc}</p>
                </Link>
                ))}
            </div>
            </div>
        </section>

        {/* About Section */}
        <section id="about" className="landing-about">
            <div className="about-container">
            <div className="about-header">
                <h2 className="about-title">About WHEELS</h2>
                <p className="about-subtitle">
                We're committed to providing exceptional car service with the highest standards of quality and customer
                satisfaction.
                </p>
            </div>

            <div className="stats-grid">
                {[
                { label: "5K+", desc: "Happy Customers" },
                { label: "24/7", desc: "Available Service" },
                { label: "50+", desc: "Expert Technicians" },
                ].map((stat, idx) => (
                <div key={idx} className="stat-card">
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-desc">{stat.desc}</div>
                </div>
                ))}
            </div>
            </div>
        </section>

        {/* Download Section */}
        <section id="download" className="landing-download">
            <div className="download-container">
            <h2 className="download-title">
                <Link href="/auth/login" className="section-title-link">
                Download WHEELS App
                </Link>
            </h2>
            <p className="download-subtitle">
                Book services, track your vehicle, and get exclusive offers right from your phone.
            </p>
            <div className="download-buttons">
                <a
                href="https://apps.apple.com/app/idYOUR_APP_ID"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-store"
                >
                App Store
                </a>
                <a
                href="https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-store"
                >
                Google Play
                </a>
            </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
            <div className="footer-container">
            <div className="footer-grid">
                <div className="footer-col">
                <div className="footer-logo">
                    <Wrench className="footer-icon" />
                    <span>WHEELS</span>
                </div>
                <p className="footer-desc">Professional car service platform</p>
                </div>
                <div className="footer-col">
                <h4 className="footer-heading">Services</h4>
                <ul className="footer-links">
                    <li>
                    <Link href="/auth/login" className="footer-link">
                        Servicing
                    </Link>
                    </li>
                    <li>
                    <Link href="/auth/login" className="footer-link">
                        Maintenance
                    </Link>
                    </li>
                    <li>
                    <Link href="/auth/login" className="footer-link">
                        Emergency
                    </Link>
                    </li>
                </ul>
                </div>
                <div className="footer-col">
                <h4 className="footer-heading">Company</h4>
                <ul className="footer-links">
                    <li>
                    <Link href="/auth/login" className="footer-link">
                        About
                    </Link>
                    </li>
                    <li>
                    <Link href="/auth/login" className="footer-link">
                        Contact
                    </Link>
                    </li>
                    <li>
                    <Link href="/auth/login" className="footer-link">
                        Careers
                    </Link>
                    </li>
                </ul>
                </div>
                <div className="footer-col">
                <h4 className="footer-heading">Contact</h4>
                <p className="footer-text">+977-1-4123456</p>
                <p className="footer-text">info@wheels.np</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 WHEELS. All rights reserved.</p>
                <div className="footer-bottom-links">
                <Link href="/auth/login" className="footer-link">
                    Privacy Policy
                </Link>
                <Link href="/auth/login" className="footer-link">
                    Terms of Service
                </Link>
                </div>
            </div>
            </div>
        </footer>
        </div>
    )
    }
