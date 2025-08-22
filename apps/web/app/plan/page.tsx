'use client'
import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Calendar, Users, DollarSign, Plane, Hotel, Activity, ArrowRight, Sparkles, MessageCircle, MapPin as MapIcon, Wallet } from 'lucide-react'

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cx('max-w-6xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </section>
  )
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx('rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm', className)}>{children}</div>
}

function Button({
  variant = 'solid',
  href,
  onClick,
  children,
}: {
  variant?: 'solid' | 'ghost'
  href?: string
  onClick?: any
  children: React.ReactNode
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[.99]'
  if (variant === 'ghost') {
    return (
      <a href={href || '#'} onClick={onClick} className={cx(base, 'bg-transparent text-slate-900 hover:bg-slate-50 ring-1 ring-slate-200')}>
        {children}
      </a>
    )
  }
  return (
    <a
      href={href || '#'}
      onClick={onClick}
      className={cx(base, 'text-slate-900 shadow-sm ring-1 ring-black/5')}
      style={{ background: 'linear-gradient(90deg,#fde047,#fbbf24,#f59e0b)' }}
    >
      {children}
    </a>
  )
}

function Input({ label, placeholder, icon, value, onChange, type = 'text' }: {
  label: string
  placeholder: string
  icon?: React.ReactNode
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cx(
            'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60',
            icon && 'pl-10'
          )}
        />
      </div>
    </div>
  )
}

function Select({ label, placeholder, options, value, onChange }: {
  label: string
  placeholder: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TripCard({ title, description, price, image, category }: {
  title: string
  description: string
  price: string
  image: string
  category: string
}) {
  return (
    <Card className="p-4 hover:shadow-md transition cursor-pointer">
      <div className="aspect-video rounded-xl bg-gradient-to-br from-amber-200/40 to-yellow-300/40 mb-3 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-1">{image}</div>
          <div className="text-xs text-slate-600">{category}</div>
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 mb-2">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">{price}</span>
        <Button variant="ghost">View Details</Button>
      </div>
    </Card>
  )
}

function BudgetBreakdown({ nights = 3, mealsPerDayCost = 25, travelers = 2 }: { nights?: number; mealsPerDayCost?: number; travelers?: number }) {
  const lodging = 210
  const meals = mealsPerDayCost * travelers * (nights + 1)
  const museums = 60
  const transport = 20
  const treats = 50
  const total = lodging + meals + museums + transport + treats
  return (
    <Card className="p-5">
      <h4 className="font-semibold text-slate-900 mb-3">Estimated Budget Breakdown</h4>
      <ul className="text-sm text-slate-700 space-y-2">
        <li className="flex items-center justify-between"><span>Hostel ({nights} nights)</span><span>~€{lodging}</span></li>
        <li className="flex items-center justify-between"><span>Meals</span><span>~€{meals}</span></li>
        <li className="flex items-center justify-between"><span>Museums/activities</span><span>€{museums}</span></li>
        <li className="flex items-center justify-between"><span>Metro/bikes</span><span>€{transport}</span></li>
        <li className="flex items-center justify-between"><span>Treats/souvenirs</span><span>€{treats}</span></li>
        <li className="flex items-center justify-between font-semibold pt-2 border-t border-slate-200"><span>Total (2 adults)</span><span>€{total}</span></li>
      </ul>
    </Card>
  )
}

function QuickAskChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs transition">
      {text}
    </button>
  )
}

export default function PlanPage() {
  const params = useSearchParams()
  const spinParam = params.get('spin')
  const [workspace, setWorkspace] = useState<boolean>(spinParam === '1')

  const [destination, setDestination] = useState('Paris')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelers, setTravelers] = useState('2')
  const [budget, setBudget] = useState('1000')
  const [tripType, setTripType] = useState('leisure')

  const tripTypes = [
    { value: 'leisure', label: 'Leisure' },
    { value: 'business', label: 'Business' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'romantic', label: 'Romantic' },
  ]

  const popularDestinations = [
    { title: 'Paris, France', description: 'City of Light with iconic landmarks', price: '€1,200', image: '🗼', category: 'Culture' },
    { title: 'Tokyo, Japan', description: 'Modern metropolis meets tradition', price: '€1,800', image: '🗾', category: 'Urban' },
    { title: 'Bali, Indonesia', description: 'Tropical paradise and spiritual retreats', price: '€900', image: '🏝️', category: 'Beach' },
    { title: 'New York, USA', description: 'The city that never sleeps', price: '€2,100', image: '🗽', category: 'Urban' },
  ]

  const handleSearch = () => {
    setWorkspace(true)
  }

  const days = 4
  const itinerary = useMemo(() => Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} • ${destination}`,
    items: ['Morning walking tour', 'Local market tasting', 'Iconic landmark visit']
  })), [destination])

  if (workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7] text-slate-900">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[52rem] rounded-full blur-3xl opacity-40"
            style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(253,224,71,.45), rgba(251,191,36,.25), transparent 70%)' }}
          />
        </div>

        <Section className="py-6">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Itinerary + chat */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 text-xs text-slate-700">
                    <MapIcon size={14} /> {destination}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 text-xs text-slate-700">
                    <Calendar size={14} /> Oct 1–4
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 text-xs text-slate-700">
                    <Users size={14} /> {travelers} travelers
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 text-xs text-slate-700">
                    <Wallet size={14} /> €{budget}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {itinerary.map((d) => (
                    <div key={d.day} className="rounded-xl ring-1 ring-slate-200 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-900">{d.title}</div>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {d.items.map((it, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 size-1.5 rounded-full bg-amber-400" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>

              <BudgetBreakdown />

              <Card className="p-5">
                <div className="text-sm font-semibold text-slate-900 mb-3">You might want to ask</div>
                <div className="flex flex-wrap gap-2">
                  {['Best free museums?', 'Local transport tips?', 'Hidden gems in Paris?', 'October weather advice?'].map((q) => (
                    <QuickAskChip key={q} text={q} onClick={() => { /* could prefill chat */ }} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 grid place-items-center">
                    <MessageCircle size={16} />
                  </div>
                  <input
                    placeholder="Ask anything..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
                  />
                  <Button>
                    <Sparkles size={16} /> Ask
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right: Map panel */}
            <div className="lg:col-span-2">
              <Card className="h-full min-h-[720px] p-0 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-2 rounded-xl ring-1 ring-slate-200 text-sm text-slate-700 flex items-center gap-2">
                  <MapIcon size={16} /> Paris map
                </div>
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full grid place-items-center mx-auto mb-3">
                      <MapIcon size={22} className="text-amber-600" />
                    </div>
                    <div className="text-slate-600 text-sm">Interactive map preview</div>
                    <div className="mt-3 flex gap-2 justify-center">
                      <Button variant="ghost"><Plane size={16}/> Flights</Button>
                      <Button variant="ghost"><Hotel size={16}/> Hotels</Button>
                      <Button variant="ghost"><Activity size={16}/> Activities</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7] text-slate-900">
      {/* Subtle glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[52rem] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(253,224,71,.45), rgba(251,191,36,.25), transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <header className="pt-10 pb-8">
        <Section>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] mb-4">
              Plan Your Perfect Trip
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Tell us where you want to go, and we'll help you create the perfect itinerary with flights, hotels, and activities.
            </p>
          </div>
        </Section>
      </header>

      {/* Search Form */}
      <Section className="pb-12">
        <Card className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Destination"
              placeholder="Where do you want to go?"
              icon={<MapPin size={16} />}
              value={destination}
              onChange={setDestination}
            />
            <Input
              label="Start Date"
              placeholder="When do you want to start?"
              icon={<Calendar size={16} />}
              value={startDate}
              onChange={setStartDate}
              type="date"
            />
            <Input
              label="End Date"
              placeholder="When do you want to return?"
              icon={<Calendar size={16} />}
              value={endDate}
              onChange={setEndDate}
              type="date"
            />
            <Input
              label="Number of Travelers"
              placeholder="How many people?"
              icon={<Users size={16} />}
              value={travelers}
              onChange={setTravelers}
              type="number"
            />
            <Input
              label="Budget"
              placeholder="What's your budget?"
              icon={<DollarSign size={16} />}
              value={budget}
              onChange={setBudget}
            />
            <Select
              label="Trip Type"
              placeholder="Select trip type"
              options={tripTypes}
              value={tripType}
              onChange={setTripType}
            />
          </div>
          <div className="mt-8 flex justify-center">
            <Button onClick={handleSearch}>
              <Sparkles size={16} />
              Plan My Trip
              <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      </Section>

      {/* Quick Actions */}
      <Section className="pb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center hover:shadow-md transition cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-200/60 to-blue-300/60 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Find Flights</h3>
            <p className="text-sm text-slate-600 mb-4">Search and compare flights from multiple airlines</p>
            <Button variant="ghost">Search Flights</Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-md transition cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-green-200/60 to-green-300/60 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Hotel size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Book Hotels</h3>
            <p className="text-sm text-slate-600 mb-4">Find the perfect place to stay</p>
            <Button variant="ghost">Find Hotels</Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-md transition cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-200/60 to-purple-300/60 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Activity size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Discover Activities</h3>
            <p className="text-sm text-slate-600 mb-4">Explore tours, experiences, and local activities</p>
            <Button variant="ghost">Browse Activities</Button>
          </Card>
        </div>
      </Section>

      {/* Popular Destinations */}
      <Section className="pb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Popular Destinations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.map((dest, index) => (
            <TripCard key={index} {...dest} />
          ))}
        </div>
      </Section>

      {/* AI Assistant */}
      <Section className="pb-12">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Need Help Planning?</h2>
            <p className="text-slate-600">Our AI assistant can help you create the perfect itinerary</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-4">What can our AI help with?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-amber-600" />
                  </div>
                  <span className="text-slate-700">Personalized itinerary recommendations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-amber-600" />
                  </div>
                  <span className="text-slate-700">Budget optimization and cost tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-amber-600" />
                  </div>
                  <span className="text-slate-700">Local insights and hidden gems</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-amber-600" />
                  </div>
                  <span className="text-slate-700">Real-time travel updates and alerts</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-amber-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Start a Conversation</h4>
                <p className="text-sm text-slate-600 mb-4">Ask our AI assistant anything about your trip</p>
                <Button href="/chat">Chat with AI</Button>
              </div>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  )
}
