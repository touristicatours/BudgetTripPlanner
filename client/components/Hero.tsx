'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plane, MapPin, Calendar, Users, Wallet } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
      
      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 text-primary/20"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Plane className="h-16 w-16" />
      </motion.div>
      
      <motion.div
        className="absolute top-40 right-20 text-secondary/20"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        <MapPin className="h-12 w-12" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-40 left-20 text-accent/20"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
      >
        <Calendar className="h-14 w-14" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="gradient-text">Weave</span> Your Perfect
            <br />
            <span className="text-text">Travel Experience</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-text/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Let AI craft your dream itinerary with budget awareness, local insights, 
            and seamless booking. From planning to adventure, we've got you covered.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/plan">
              <motion.button
                className="btn-primary text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Plan Your Trip
              </motion.button>
            </Link>
            
            <Link href="/offers">
              <motion.button
                className="btn-secondary text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Offers
              </motion.button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Plane, text: 'AI-Powered Planning' },
              { icon: MapPin, text: 'Local Insights' },
              { icon: Calendar, text: 'Smart Scheduling' },
              { icon: Users, text: 'Group Travel' },
              { icon: Wallet, text: 'Budget Management' },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="text-sm text-text/80">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
