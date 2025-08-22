'use client'
import React, { useMemo, useState } from 'react'

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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs ring-1 ring-amber-200">
      {children}
    </span>
  )
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

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M20 7L10 17l-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSpark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M12 2l1.8 4.9L19 9l-5.2 2.1L12 16l-1.8-4.9L5 9l5.2-2.1L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        className="text-yellow-400"
      />
    </svg>
  )
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx('rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm', className)}>{children}</div>
}

function Feature({ title, desc, badge }: { title: string; desc: string; badge?: string }) {
  return (
    <Card className="p-5 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="mt-1 size-9 rounded-xl bg-gradient-to-br from-yellow-200/60 to-amber-300/60 ring-1 ring-amber-200 grid place-items-center">
          <IconSpark />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900">{title}</h4>
            {badge && <Pill>{badge}</Pill>}
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Card>
  )
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-slate-900">{v}</div>
      <div className="text-xs text-slate-500 mt-1">{k}</div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200">
      <button onClick={() => setOpen(!open)} className="w-full py-4 flex items-center justify-between text-left">
        <span className="text-slate-900 font-medium">{q}</span>
        <span className="text-slate-500 text-sm">{open ? '–' : '+'}</span>
      </button>
      {open && <p className="pb-4 text-slate-600 text-sm leading-relaxed">{a}</p>}
    </div>
  )
}

function Logo({ label }: { label: string }) {
  return (
    <div className="h-9 w-28 rounded-xl bg-white ring-1 ring-slate-200 grid place-items-center text-[10px] tracking-wide uppercase text-slate-500">
      {label}
    </div>
  )
}

function Testimonial({ quote, name, title }: { quote: string; name: string; title: string }) {
  return (
    <Card className="p-5">
      <p className="text-slate-800">“{quote}”</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="size-8 rounded-full bg-slate-100 ring-1 ring-slate-200 grid place-items-center text-xs text-slate-700">
          {name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div>
          <div className="text-slate-900 text-sm font-medium">{name}</div>
          <div className="text-slate-500 text-xs">{title}</div>
        </div>
      </div>
    </Card>
  )
}

function BudgetSlider({ value, setValue }: { value: number; setValue: (n: number) => void }) {
  return (
    <div className="w-full">
      <input type="range" min={300} max={5000} step={50} value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full accent-yellow-400" />
      <div className="mt-2 text-xs text-slate-600">Budget: €{value.toLocaleString()}</div>
    </div>
  )
}

function Toggle({ label, on, setOn }: { label: string; on: boolean; setOn: (b: boolean) => void }) {
  return (
    <button
      onClick={() => setOn(!on)}
      className={cx(
        'text-xs px-3 py-1 rounded-full ring-1 transition',
        on ? 'bg-yellow-400 text-slate-900 ring-yellow-300' : 'text-slate-700 ring-slate-200 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  )
}

function ItineraryPreview({ days, activitiesPerDay }: { days: number; activitiesPerDay: number }) {
  const items = useMemo(() => Array.from({ length: days }, (_, i) => i + 1), [days])
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-slate-900 font-semibold">Your plan</h4>
          <p className="text-slate-500 text-xs">
            {days} days • {activitiesPerDay} activities/day
          </p>
        </div>
        <span className="text-[10px] text-slate-500">AI Draft</span>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((d) => (
          <div key={d} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
            <div className="text-slate-600 text-xs">Day {d}</div>
            <ul className="mt-2 text-slate-800 text-sm list-disc pl-4 space-y-1">
              {Array.from({ length: activitiesPerDay }).map((_, i) => (
                <li key={i}>Activity {i + 1}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Footer() {
  return (
    <footer className="relative mt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 inset-x-0 h-10 bg-gradient-to-b from-amber-300/35 via-amber-200/15 to-transparent blur-2xl"
      />
      <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-amber-50 to-white ring-1 ring-black/5 shadow-lg shadow-amber-100/40 p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-4 items-start">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white">TW</span>
                TripWeaver
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Plan trips the fun way. AI co-creates your itinerary — fast, flexible, and budget-friendly.
              </p>
              <div className="mt-4 flex gap-3">
                {['twitter', 'instagram', 'linkedin'].map((icon) => (
                  <a key={icon} href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 hover:ring-amber-300 transition">
                    <span className="sr-only">{icon}</span>
                    <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                  </a>
                ))}
              </div>
            </div>

            <nav className="grid gap-2 text-sm">
              <h3 className="font-semibold text-slate-900">Features</h3>
              <a className="text-slate-600 hover:text-slate-900" href="/plan">Plan Trip</a>
              <a className="text-slate-600 hover:text-slate-900" href="/chat">AI Chat</a>
              <a className="text-slate-600 hover:text-slate-900" href="/maps">Interactive Maps</a>
              <a className="text-slate-600 hover:text-slate-900" href="/trips">My Trips</a>
            </nav>

            <nav className="grid gap-2 text-sm">
              <h3 className="font-semibold text-slate-900">Support</h3>
              <a className="text-slate-600 hover:text-slate-900" href="/chat">AI Assistant</a>
              <a className="text-slate-600 hover:text-slate-900" href="#">Help Center</a>
              <a className="text-slate-600 hover:text-slate-900" href="#">Contact</a>
              <a className="text-slate-600 hover:text-slate-900" href="#">Privacy</a>
            </nav>

            <div className="grid gap-3">
              <h3 className="font-semibold text-slate-900">Newsletter</h3>
              <p className="text-sm text-slate-600">Fresh hidden gems & itinerary tips.</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
                />
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 text-sm font-semibold text-white shadow-sm hover:brightness-105"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200/70 pt-6 text-xs text-slate-500 flex flex-wrap items-center gap-4 justify-between">
            <p>© {new Date().getFullYear()} TripWeaver. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-700">Terms</a>
              <a href="#" className="hover:text-slate-700">Privacy</a>
              <a href="#" className="hover:text-slate-700">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const [budget, setBudget] = useState(1200)
  const [fastPace, setFastPace] = useState(false)
  const [nightlife, setNightlife] = useState(false)

  const days = nightlife ? 5 : 4
  const activitiesPerDay = fastPace ? 4 : 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbea] via-[#fff8e1] to-[#fffde7] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[52rem] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(60% 60% at 50% 50%, rgba(253,224,71,.45), rgba(251,191,36,.25), transparent 70%)' }}
        />
      </div>

      <nav className="sticky top-0 z-20 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Section className="flex items-center justify-between py-4">
          <a href="#" className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-yellow-400 text-slate-900 grid place-items-center font-black">TW</div>
            <span className="font-semibold">TripWeaver</span>
          </a>
          <div className="hidden sm:flex items-center gap-2">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how" className="text-sm text-slate-600 hover:text-slate-900">How it works</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900">FAQ</a>
          </div>
                      <div className="flex items-center gap-2">
              <Button variant="ghost" href="/login">Sign in</Button>
              <Button href="/workspace">Spin up my trip</Button>
            </div>
        </Section>
      </nav>

      <header className="pt-10 pb-14">
        <Section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Pill>
              <IconSpark />
              Chatbot to build itinerary
            </Pill>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black leading-[1.05]">Co-create your perfect trip with AI — then book, all in one place.</h1>
            <p className="mt-4 text-slate-600 text-base leading-relaxed max-w-prose">
              Add, swap, and refine in seconds. Keep everything on budget. Invite friends. Export to PDF. Your travel co-pilot that actually does the work.
            </p>
                          <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/workspace">Spin up my trip</Button>
                <Button variant="ghost" href="#demo">Watch 1-min demo</Button>
              </div>
            <div className="mt-6 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="size-8 rounded-full ring-2 ring-white bg-amber-100 grid place-items-center text-[10px]">{'★'}</div>
                ))}
              </div>
              <div className="text-sm text-slate-600">Loved by early travelers</div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-white ring-1 ring-slate-200 p-4 shadow-sm">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-yellow-200/40 to-amber-300/40 ring-1 ring-slate-200 grid place-items-center text-slate-600">
                <div className="text-center">
                  <div className="text-sm">Chatbot to build itinerary</div>
                  <div className="text-xs opacity-80">Add, swap, and refine in seconds</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white ring-1 ring-slate-200 rounded-2xl p-3 shadow-sm">
              <div className="text-xs text-slate-500">ETA to ✈︎ BCN</div>
              <div className="font-semibold">2h 15m</div>
            </div>
            <div className="absolute -top-5 -right-5 bg-white ring-1 ring-slate-200 rounded-2xl p-3 shadow-sm">
              <div className="text-xs text-slate-500">Budget left</div>
              <div className="font-semibold">€420</div>
            </div>
          </div>
        </Section>
      </header>

      <Section className="pb-10">
        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="p-4"><Stat k="Avg plan time" v="3m 42s" /></Card>
          <Card className="p-4"><Stat k="Activities curated" v="+24k" /></Card>
          <Card className="p-4"><Stat k="Price accuracy" v="~94%" /></Card>
        </div>
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-3 place-items-center opacity-90">
          {'AirBuddy, StayPro, GoCity, FlyNow, Bookly, Globe+'.split(', ').map((l) => (
            <Logo key={l} label={l} />
          ))}
        </div>
      </Section>

      <Section id="features" className="py-6">
        <div className="grid md:grid-cols-2 gap-5">
          <Feature title="Co-create with AI" desc="Tell us the vibe. We draft a complete plan you can click to edit: add, swap, pin must-dos, and watch the budget adjust live." badge="Core" />
          <Feature title="Live budget & price guard" desc="Targets per day and trip. Alerts if a change pushes you over — with cheaper, similar alternatives one tap away." />
          <Feature title="Compare flights & stays, side-by-side" desc="One canvas, all channels. Real-time filters by total trip cost, distance, and review quality." />
          <Feature title="Collaborate & share" desc="Invite friends, set roles, collect preferences, and export a beautiful offline PDF for the trip." />
        </div>
      </Section>

      <Section id="demo" className="py-10">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="p-5 lg:col-span-1">
            <h3 className="text-slate-900 font-semibold">Trip vibe</h3>
            <p className="text-slate-600 text-sm mt-1">Try the toggles — the preview updates instantly.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Toggle label="Fast pace" on={fastPace} setOn={setFastPace} />
              <Toggle label="Nightlife" on={nightlife} setOn={setNightlife} />
            </div>
            <div className="mt-6">
              <BudgetSlider value={budget} setValue={setBudget} />
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-700"><IconCheck /> {fastPace ? '4-5' : '3'} picks per day</li>
              <li className="flex items-center gap-2 text-slate-700"><IconCheck /> Max budget ~ €{(budget * 1.05).toFixed(0)}</li>
              <li className="flex items-center gap-2 text-slate-700"><IconCheck /> {nightlife ? 'Bars & late shows included' : 'Balanced mornings + evenings'}</li>
            </ul>
            <div className="mt-6 flex gap-2">
              <Button href="/workspace">Spin My Trip</Button>
              <Button variant="ghost" href="/chat">Chat with AI</Button>
            </div>
          </Card>
          <div className="lg:col-span-2">
            <ItineraryPreview days={days} activitiesPerDay={activitiesPerDay} />
          </div>
        </div>
      </Section>

      <Section id="how" className="py-12">
        <div className="grid md:grid-cols-3 gap-5">
          {['Describe your trip', 'Edit in one canvas', 'Book in one place'].map((step, i) => (
            <Card key={i} className="p-5">
              <div className="size-9 rounded-xl bg-slate-50 ring-1 ring-slate-200 grid place-items-center text-sm font-semibold">{i + 1}</div>
              <h4 className="mt-3 text-slate-900 font-semibold">{step}</h4>
              <p className="mt-1 text-sm text-slate-600">
                {i === 0 && 'Dates, vibe, budget. We build a plan in seconds.'}
                {i === 1 && 'Drag, drop, or chat to add and swap. Budget updates live.'}
                {i === 2 && 'Compare flights & stays, then export a PDF or share with friends.'}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-6">
        <div className="grid md:grid-cols-3 gap-5">
          <Testimonial quote="The fastest way I’ve ever planned a weekend in Lisbon." name="Maya L." title="Student" />
          <Testimonial quote="Budget stayed on track even after we added a food tour." name="Samir D." title="Consultant" />
          <Testimonial quote="Loved the PDF — perfect for offline days." name="Alex P." title="Photographer" />
        </div>
      </Section>

      <Section id="faq" className="py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-slate-900 font-semibold">FAQs</h3>
            <FaqItem q="Is it really free to start?" a="Yes. You can plan trips and export a basic PDF for free. Bookings use partner pricing and may include affiliate fees." />
            <FaqItem q="Do you support group trips?" a="Invite friends to co-edit, vote on options, and split costs." />
            <FaqItem q="Which cities are best covered?" a="We cover all major destinations and popular mid-size cities. Coverage grows weekly." />
          </Card>
          <Card className="p-5">
            <h3 className="text-slate-900 font-semibold">What makes it different?</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><IconCheck /> Live budget guardrails</li>
              <li className="flex items-center gap-2"><IconCheck /> One canvas for everything</li>
              <li className="flex items-center gap-2"><IconCheck /> PDF + offline mode</li>
              <li className="flex items-center gap-2"><IconCheck /> Collaborate in real time</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
