'use client'

import { useState } from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter, 
  Badge, 
  Input, 
  Select, 
  Skeleton, 
  Section, 
  NavBar 
} from '@/components/ui'
import { 
  Search, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Star, 
  Heart, 
  Settings,
  Home,
  Plane,
  Hotel,
  Activity
} from 'lucide-react'

export default function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')

  const selectOptions = [
    { value: 'paris', label: 'Paris, France' },
    { value: 'tokyo', label: 'Tokyo, Japan' },
    { value: 'new-york', label: 'New York, USA' },
    { value: 'london', label: 'London, UK' },
  ]

  const navItems = [
    { label: 'Home', href: '/', icon: <Home size={16} /> },
    { label: 'Flights', href: '/flights', icon: <Plane size={16} /> },
    { label: 'Hotels', href: '/hotels', icon: <Hotel size={16} /> },
    { label: 'Activities', href: '/activities', icon: <Activity size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <NavBar
        brand={
          <div className="flex items-center gap-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary text-white font-bold">
              DS
            </span>
            <span className="text-lg font-semibold">Design System</span>
          </div>
        }
        items={navItems}
        rightItems={
          <div className="flex items-center gap-sm">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
          </div>
        }
      />

      {/* Hero Section */}
      <Section className="bg-gradient-subtle">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-md">Design System</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            A comprehensive design system with standardized tokens, components, and patterns
            for building consistent and accessible user interfaces.
          </p>
        </div>
      </Section>

      {/* Color Tokens */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Color Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
          <Card>
            <CardBody>
              <div className="h-20 bg-brand-amber rounded-lg mb-sm"></div>
              <h3 className="font-semibold">Brand Amber</h3>
              <p className="text-sm text-muted">Primary brand color</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="h-20 bg-fg rounded-lg mb-sm"></div>
              <h3 className="font-semibold">Foreground</h3>
              <p className="text-sm text-muted">Primary text color</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="h-20 bg-fg-muted rounded-lg mb-sm"></div>
              <h3 className="font-semibold">Muted</h3>
              <p className="text-sm text-muted">Secondary text color</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="h-20 bg-bg-subtle rounded-lg mb-sm"></div>
              <h3 className="font-semibold">Background</h3>
              <p className="text-sm text-muted">Background color</p>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Typography */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Typography</h2>
        <div className="space-y-md">
          <div>
            <h1 className="mb-sm">Heading 1 - Main Title</h1>
            <h2 className="mb-sm">Heading 2 - Section Title</h2>
            <h3 className="mb-sm">Heading 3 - Subsection Title</h3>
            <h4 className="mb-sm">Heading 4 - Card Title</h4>
            <h5 className="mb-sm">Heading 5 - Small Title</h5>
            <h6 className="mb-sm">Heading 6 - Tiny Title</h6>
          </div>
          <div>
            <p className="mb-sm">
              This is a paragraph with regular body text. It demonstrates the standard
              line height and spacing for readable content.
            </p>
            <p className="caption">
              This is caption text, typically used for metadata, timestamps, or
              supplementary information.
            </p>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Buttons</h2>
        
        <div className="space-y-lg">
          <div>
            <h3 className="text-xl font-semibold mb-md">Variants</h3>
            <div className="flex flex-wrap gap-md">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-md">Sizes</h3>
            <div className="flex flex-wrap items-center gap-md">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-md">States</h3>
            <div className="flex flex-wrap gap-md">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<Heart size={16} />}>With Icon</Button>
              <Button rightIcon={<Star size={16} />}>With Icon</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Cards */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Basic Card</h3>
            </CardHeader>
            <CardBody>
              <p>This is a basic card with header, body, and footer sections.</p>
            </CardBody>
            <CardFooter>
              <Button variant="primary" size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-md mb-md">
                <div className="w-12 h-12 bg-brand-amber rounded-full flex items-center justify-center">
                  <Star className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Featured Destination</h3>
                  <p className="text-sm text-muted">Paris, France</p>
                </div>
              </div>
              <p className="text-sm text-muted mb-md">
                Experience the magic of the City of Light with our curated travel guide.
              </p>
              <div className="flex gap-sm">
                <Badge variant="primary">Popular</Badge>
                <Badge variant="success">Available</Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="font-semibold mb-md">Interactive Card</h3>
              <p className="text-sm text-muted mb-md">
                This card demonstrates hover effects and interactive elements.
              </p>
              <div className="flex gap-sm">
                <Button variant="outline" size="sm">Learn More</Button>
                <Button variant="ghost" size="sm">Share</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Badges */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Badges</h2>
        <div className="flex flex-wrap gap-md">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge leftIcon={<Star size={12} />}>With Icon</Badge>
          <Badge rightIcon={<Heart size={12} />}>With Icon</Badge>
        </div>
      </Section>

      {/* Form Elements */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Form Elements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          <div className="space-y-lg">
            <h3 className="text-xl font-semibold">Inputs</h3>
            
            <Input
              label="Email Address"
              placeholder="Enter your email"
              leftIcon={<Mail size={16} />}
              helperText="We'll never share your email with anyone else."
            />

            <Input
              label="Search Destinations"
              placeholder="Where do you want to go?"
              leftIcon={<Search size={16} />}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <Input
              label="Username"
              placeholder="Enter username"
              leftIcon={<User size={16} />}
              error={true}
              errorText="Username is required"
            />
          </div>

          <div className="space-y-lg">
            <h3 className="text-xl font-semibold">Selects</h3>
            
            <Select
              label="Destination"
              placeholder="Choose a destination"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
            />

            <Select
              label="Travel Date"
              placeholder="Select travel date"
              options={[
                { value: 'next-week', label: 'Next Week' },
                { value: 'next-month', label: 'Next Month' },
                { value: 'next-quarter', label: 'Next Quarter' },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Skeletons */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Loading States</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          <Card>
            <CardBody>
              <div className="flex items-center gap-md mb-md">
                <Skeleton variant="avatar" />
                <div className="flex-1">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
              <Skeleton variant="text" lines={3} />
              <div className="flex gap-sm mt-md">
                <Skeleton variant="button" />
                <Skeleton variant="button" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Skeleton variant="card" className="mb-md" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Skeleton variant="text" />
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="90%" />
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* Spacing & Layout */}
      <Section>
        <h2 className="text-3xl font-semibold mb-lg">Spacing & Layout</h2>
        
        <div className="space-y-lg">
          <div>
            <h3 className="text-xl font-semibold mb-md">Spacing Scale</h3>
            <div className="space-y-sm">
              <div className="flex items-center gap-md">
                <div className="w-4 h-4 bg-brand-amber rounded"></div>
                <span className="text-sm">xs (4px)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-8 h-8 bg-brand-amber rounded"></div>
                <span className="text-sm">sm (8px)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-16 h-16 bg-brand-amber rounded"></div>
                <span className="text-sm">md (16px)</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="w-24 h-24 bg-brand-amber rounded"></div>
                <span className="text-sm">lg (24px)</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-md">Grid System</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardBody>
                    <div className="h-20 bg-bg-subtle rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted">Grid Item {i + 1}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section className="bg-bg-muted">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-md">Design System Complete</h2>
          <p className="text-muted mb-lg">
            All components are built with standardized tokens and follow consistent patterns.
          </p>
          <Button variant="primary" size="lg">
            Start Building
          </Button>
        </div>
      </Section>
    </div>
  )
}
