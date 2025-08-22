'use client'

import Link from 'next/link'
import { Plane, Mail, Twitter, Instagram, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Plane className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">TripWeaver</span>
            </Link>
            <p className="text-text/70 mb-6 max-w-md">
              Transform your travel dreams into reality with AI-powered planning, 
              smart budgeting, and seamless booking experiences.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Mail, href: 'mailto:hello@tripweaver.com', label: 'Email' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-card border border-white/10 rounded-full flex items-center justify-center text-text/60 hover:text-primary hover:border-primary/30 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/plan', label: 'Plan Trip' },
                { href: '/offers', label: 'Browse Offers' },
                { href: '/trips', label: 'My Trips' },
                { href: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-text/70 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Support</h3>
            <ul className="space-y-2">
              {[
                { href: '/help', label: 'Help Center' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-text/70 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text/60 text-sm">
            © 2024 TripWeaver. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-text/60 hover:text-primary text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-text/60 hover:text-primary text-sm transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-text/60 hover:text-primary text-sm transition-colors duration-200">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
