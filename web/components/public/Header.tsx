"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { BrandMark } from "@/components/shared/BrandMark"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center">
          <BrandMark size={36} showText textClassName="text-2xl font-heading font-bold text-primary-600" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-slate-600 hover:text-primary-600 font-medium transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-slate-600 hover:text-primary-600 font-medium transition-colors duration-200"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-slate-600 hover:text-primary-600 font-medium transition-colors duration-200"
          >
            Login
          </Link>
        </nav>

        {/* Desktop CTA */}
        <Button
          asChild
          className="hidden md:flex bg-primary-500 hover:bg-primary-600 text-white px-7 py-3 rounded-[10px] font-semibold text-base shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Link href="/signup">Start Free Trial</Link>
        </Button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-primary-600 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white z-40 shadow-xl border-t border-slate-200">
          <nav className="flex flex-col p-6 space-y-6">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 hover:text-primary-600 font-medium text-lg transition-colors duration-200 py-2"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 hover:text-primary-600 font-medium text-lg transition-colors duration-200 py-2"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-600 hover:text-primary-600 font-medium text-lg transition-colors duration-200 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-7 py-4 rounded-[10px] font-semibold text-base shadow-[0_4px_14px_rgba(59,130,246,0.3)] text-center transition-all duration-200"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
