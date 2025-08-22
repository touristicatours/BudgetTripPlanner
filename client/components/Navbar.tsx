'use client'

import Link from 'next/link'
import { Plane, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Plane className="h-8 w-8 text-primary group-hover:text-secondary transition-colors duration-300" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-full opacity-0 group-hover:opacity-20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-2xl font-bold gradient-text">TripWeaver</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/plan" 
              className="text-text/80 hover:text-primary transition-colors duration-200"
            >
              Plan Trip
            </Link>
            <Link 
              href="/offers" 
              className="text-text/80 hover:text-primary transition-colors duration-200"
            >
              Offers
            </Link>
            <Link 
              href="/trips" 
              className="text-text/80 hover:text-primary transition-colors duration-200"
            >
              My Trips
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/plan">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Plan Your Trip
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-text hover:bg-card transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10"
            >
              <div className="py-4 space-y-4">
                <Link 
                  href="/plan" 
                  className="block px-4 py-2 text-text/80 hover:text-primary hover:bg-card/50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Plan Trip
                </Link>
                <Link 
                  href="/offers" 
                  className="block px-4 py-2 text-text/80 hover:text-primary hover:bg-card/50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Offers
                </Link>
                <Link 
                  href="/trips" 
                  className="block px-4 py-2 text-text/80 hover:text-primary hover:bg-card/50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Trips
                </Link>
                <div className="px-4 pt-2">
                  <Link href="/plan" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full btn-primary">
                      Plan Your Trip
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
