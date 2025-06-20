"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import type React from "react"
import { Menu } from "lucide-react"

export function Navigation({ language, setLanguage }: { language: string; setLanguage: (lang: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const links = [
    { href: "#education", label: language === "en" ? "Education" : "Formation" },
    { href: "#experience", label: language === "en" ? "Experience" : "Expérience" },
    { href: "#languages", label: language === "en" ? "Languages" : "Langues" },
    { href: "#projects", label: language === "en" ? "Projects" : "Projets" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
    setIsMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setLanguage("en")}
              className={`mr-2 p-2 rounded-full ${language === "en" ? "bg-mint-500" : "bg-white"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("fr")}
              className={`p-2 rounded-full ${language === "fr" ? "bg-mint-500" : "bg-white"}`}
            >
              FR
            </button>
          </div>

          <div className="hidden md:flex space-x-8">
            {links.map((link, index) => (
              <motion.div key={index} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <a
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="text-mint-600 hover:text-mint-800 transition-colors"
                >
                  {link.label}
                </a>
              </motion.div>
            ))}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-mint-600">
              <Menu />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className="block py-2 text-mint-600 hover:text-mint-800 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.nav>
  )
}
