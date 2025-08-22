'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Globe, 
  CreditCard, 
  Map, 
  Clock, 
  Users,
  Shield,
  Zap
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Planning',
    description: 'Our advanced AI understands your preferences and creates personalized itineraries that match your travel style and budget.',
    color: 'from-secondary to-primary'
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Access to millions of destinations, activities, and accommodations worldwide with real-time availability and pricing.',
    color: 'from-primary to-accent'
  },
  {
    icon: CreditCard,
    title: 'Budget Management',
    description: 'Smart budget allocation ensures you get the most value while staying within your financial comfort zone.',
    color: 'from-accent to-secondary'
  },
  {
    icon: Map,
    title: 'Local Insights',
    description: 'Discover hidden gems and authentic experiences recommended by locals and travel experts.',
    color: 'from-secondary to-accent'
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Intelligent time management that considers opening hours, travel time, and optimal visit sequences.',
    color: 'from-primary to-secondary'
  },
  {
    icon: Users,
    title: 'Group Travel',
    description: 'Plan trips for any group size with shared preferences, budgets, and collaborative planning features.',
    color: 'from-accent to-primary'
  },
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'End-to-end encrypted payments and secure booking with trusted travel partners worldwide.',
    color: 'from-secondary to-primary'
  },
  {
    icon: Zap,
    title: 'Instant Updates',
    description: 'Real-time notifications for price changes, availability updates, and travel alerts.',
    color: 'from-primary to-accent'
  }
]

export function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Why Choose <span className="gradient-text">TripWeaver</span>?
          </h2>
          <p className="text-xl text-text/70 max-w-3xl mx-auto">
            Experience the future of travel planning with cutting-edge AI technology 
            and seamless booking integration.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card group hover:scale-[1.02] transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-bg" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 text-text">
                {feature.title}
              </h3>
              <p className="text-text/70 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="text-lg text-text/70 mb-6">
            Ready to start your next adventure?
          </p>
          <motion.button
            className="btn-primary text-lg px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Planning Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
