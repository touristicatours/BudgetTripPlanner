# 🎨 Design System Documentation

## Overview

This design system provides a comprehensive set of standardized tokens, components, and patterns for building consistent and accessible user interfaces across the BudgetTripPlanner application.

## 🎯 Design Principles

### 1. **Consistency**
- All components use standardized design tokens
- Consistent spacing, typography, and color usage
- Unified interaction patterns

### 2. **Accessibility**
- High contrast color schemes
- Clear focus indicators
- Keyboard navigation support
- Screen reader compatibility

### 3. **Performance**
- Optimized transitions (150-200ms)
- Respect for reduced motion preferences
- Efficient CSS with utility classes

### 4. **Scalability**
- Modular component architecture
- Reusable design tokens
- Flexible layout system

## 🎨 Design Tokens

### Color Tokens

```css
/* Brand Colors */
--brand-amber: 245 158 11; /* Primary brand color */
--brand-amber-hover: 217 119 6; /* Hover state */
--brand-amber-light: 253 230 138; /* Light variant */

/* Foreground Colors */
--fg: 15 23 42; /* Primary text */
--fg-muted: 100 116 139; /* Secondary text */
--fg-subtle: 148 163 184; /* Subtle text */

/* Background Colors */
--bg: 255 255 255; /* Primary background */
--bg-muted: 248 250 252; /* Muted background */
--bg-subtle: 241 245 249; /* Subtle background */

/* Focus Ring */
--ring: 245 158 11; /* Focus ring color */
--ring-focus: 217 119 6; /* Focus ring hover */

/* Semantic Colors */
--success: 34 197 94; /* Green */
--warning: 234 179 8; /* Yellow */
--error: 239 68 68; /* Red */
--info: 59 130 246; /* Blue */
```

### Typography Scale

```css
/* Font Sizes */
--font-size-xs: 0.75rem; /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem; /* 36px */
--font-size-5xl: 3rem; /* 48px */
--font-size-6xl: 3.75rem; /* 60px */

/* Line Heights */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing Scale (8pt Grid)

```css
--space-xs: 0.25rem; /* 4px */
--space-sm: 0.5rem; /* 8px */
--space-md: 1rem; /* 16px */
--space-lg: 1.5rem; /* 24px */
--space-xl: 2rem; /* 32px */
--space-2xl: 3rem; /* 48px */
--space-3xl: 4rem; /* 64px */
```

### Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-2xl: 1.5rem; /* 24px */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-normal: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

## 🧩 Component Library

### Button

A versatile button component with multiple variants, sizes, and states.

```tsx
import { Button } from '@/components/ui'

// Basic usage
<Button variant="primary" size="md">
  Click me
</Button>

// With icons
<Button 
  variant="outline" 
  size="lg"
  leftIcon={<Search size={16} />}
  rightIcon={<ArrowRight size={16} />}
>
  Search
</Button>

// Loading state
<Button loading>Processing...</Button>

// As a link
<Button asChild variant="primary">
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- `asChild`: boolean (for polymorphic rendering)

### Card

A flexible card component with header, body, and footer sections.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui'

<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here...</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

### Badge

A small component for displaying status, labels, or categories.

```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Active</Badge>
<Badge variant="warning" leftIcon={<AlertTriangle size={12} />}>
  Warning
</Badge>
```

**Variants:** 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

### Input

A form input component with support for icons, labels, and validation states.

```tsx
import { Input } from '@/components/ui'

<Input
  label="Email Address"
  placeholder="Enter your email"
  leftIcon={<Mail size={16} />}
  helperText="We'll never share your email"
  error={hasError}
  errorText="Please enter a valid email"
/>
```

### Select

A dropdown select component with options and validation.

```tsx
import { Select } from '@/components/ui'

<Select
  label="Country"
  placeholder="Choose a country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  value={selectedCountry}
  onChange={setSelectedCountry}
/>
```

### Skeleton

A loading placeholder component for content that's being fetched.

```tsx
import { Skeleton } from '@/components/ui'

// Text skeleton
<Skeleton variant="text" lines={3} />

// Avatar skeleton
<Skeleton variant="avatar" />

// Custom skeleton
<Skeleton variant="custom" width="200px" height="100px" />
```

### Section

A layout component for organizing page content with consistent spacing.

```tsx
import { Section } from '@/components/ui'

<Section size="lg" container={true}>
  <h2>Page Content</h2>
  <p>This content will be properly spaced and contained.</p>
</Section>
```

### NavBar

A navigation bar component with brand, menu items, and right-side content.

```tsx
import { NavBar } from '@/components/ui'

<NavBar
  brand={<Logo />}
  items={[
    { label: 'Home', href: '/', icon: <Home size={16} /> },
    { label: 'About', href: '/about' },
  ]}
  rightItems={<UserMenu />}
/>
```

## 🎨 Utility Classes

### Spacing

```css
.p-xs, .p-sm, .p-md, .p-lg, .p-xl /* Padding */
.px-xs, .px-sm, .px-md, .px-lg, .px-xl /* Horizontal padding */
.py-xs, .py-sm, .py-md, .py-lg, .py-xl /* Vertical padding */
.m-xs, .m-sm, .m-md, .m-lg, .m-xl /* Margin */
.mx-auto /* Center horizontally */
```

### Typography

```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl
.font-normal, .font-medium, .font-semibold, .font-bold
.text-center, .text-left, .text-right
.text-muted, .text-subtle
```

### Layout

```css
.flex, .inline-flex, .flex-col, .flex-row
.items-center, .items-start, .items-end
.justify-center, .justify-between, .justify-start, .justify-end
.gap-xs, .gap-sm, .gap-md, .gap-lg, .gap-xl
```

### Grid

```css
.grid, .grid-cols-1, .grid-cols-2, .grid-cols-3, .grid-cols-4
.sm:grid-cols-2, .md:grid-cols-3, .lg:grid-cols-4
```

### Borders & Shadows

```css
.rounded-sm, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-full
.shadow-sm, .shadow-md, .shadow-lg, .shadow-xl
```

### Transitions

```css
.transition, .transition-fast, .transition-slow
```

## 🎭 Interaction Patterns

### Focus Management

All interactive elements have visible focus indicators:

```css
.focus-visible {
  outline: 2px solid rgb(var(--ring-focus));
  outline-offset: 2px;
}
```

### Hover States

Consistent hover effects across all components:

```css
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}
```

### Loading States

Standardized loading patterns:

```css
.loading {
  opacity: 0.6;
  pointer-events: none;
}
```

### Empty States

Consistent empty state styling:

```css
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: rgb(var(--fg-muted));
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Grid System

The grid system automatically adapts to screen size:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
  {/* Items will stack on mobile, 2 columns on tablet, 3 on desktop */}
</div>
```

## 🌙 Dark Mode Support

The design system includes dark mode support through CSS custom properties:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --fg: 248 250 252; /* Light text */
    --bg: 15 23 42; /* Dark background */
    /* ... other dark mode tokens */
  }
}
```

## ♿ Accessibility Features

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Tab order follows logical document flow

### Screen Readers

- Proper ARIA labels and roles
- Semantic HTML structure
- Screen reader only content with `.sr-only` class

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🚀 Usage Guidelines

### 1. **Consistent Spacing**
Always use the spacing scale for margins and padding:
```tsx
// ✅ Good
<div className="p-lg mb-md">

// ❌ Avoid
<div className="p-6 mb-4">
```

### 2. **Color Usage**
Use semantic color tokens instead of hardcoded values:
```tsx
// ✅ Good
<div className="text-muted bg-bg-subtle">

// ❌ Avoid
<div className="text-gray-500 bg-gray-100">
```

### 3. **Component Composition**
Compose complex UIs from simple components:
```tsx
// ✅ Good
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
</Card>

// ❌ Avoid
<div className="bg-white rounded-lg shadow-md p-6">
  <div className="border-b pb-4 mb-4">
    <h3>Title</h3>
  </div>
  <p>Content</p>
</div>
```

### 4. **Responsive Design**
Always consider mobile-first design:
```tsx
// ✅ Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Avoid
<div className="grid grid-cols-3">
```

## 📚 Examples

### Complete Page Example

```tsx
import { Section, Card, CardBody, Button, Badge } from '@/components/ui'

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-bg">
      <Section>
        <div className="text-center mb-lg">
          <h1 className="text-4xl font-bold text-fg mb-md">
            Welcome to Our App
          </h1>
          <p className="text-lg text-muted">
            This page demonstrates the design system in action.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          <Card>
            <CardBody>
              <h3 className="text-xl font-semibold mb-md">Feature 1</h3>
              <p className="text-muted mb-md">
                Description of the first feature.
              </p>
              <div className="flex gap-sm">
                <Badge variant="primary">New</Badge>
                <Button variant="outline" size="sm">Learn More</Button>
              </div>
            </CardBody>
          </Card>
          {/* More cards... */}
        </div>
      </Section>
    </div>
  )
}
```

## 🔧 Customization

### Extending Components

To extend a component while maintaining consistency:

```tsx
import { Button } from '@/components/ui'

// Custom button variant
<Button 
  variant="primary" 
  className="bg-gradient-to-r from-purple-500 to-pink-500"
>
  Custom Button
</Button>
```

### Adding New Tokens

To add new design tokens, extend the CSS custom properties:

```css
:root {
  /* Existing tokens... */
  
  /* New custom tokens */
  --custom-color: 123 456 789;
  --custom-spacing: 2.5rem;
}
```

## 📖 Resources

- [Design System Showcase](/design-system) - Interactive component library
- [Figma Design Tokens](link-to-figma) - Visual design tokens
- [Accessibility Guidelines](link-to-a11y) - WCAG compliance guide
- [Component API Reference](link-to-api) - Detailed component documentation

---

This design system is living documentation that evolves with the application. For questions or contributions, please refer to the project's contribution guidelines.
