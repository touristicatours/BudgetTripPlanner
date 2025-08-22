import React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
}

export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode
  items?: NavItem[]
  rightItems?: React.ReactNode
  mobileMenu?: React.ReactNode
}

const NavBar = React.forwardRef<HTMLElement, NavBarProps>(
  ({ 
    className, 
    brand,
    items = [],
    rightItems,
    mobileMenu,
    ...props 
  }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn('navbar', className)}
        {...props}
      >
        <div className="navbar-container">
          {/* Brand */}
          {brand && (
            <div className="flex items-center">
              {brand}
            </div>
          )}

          {/* Desktop Navigation */}
          {items.length > 0 && (
            <div className="hidden md:flex items-center gap-lg">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-sm px-md py-sm rounded-md transition-colors',
                    item.active 
                      ? 'text-brand-amber font-medium' 
                      : 'text-fg-muted hover:text-fg hover:bg-bg-subtle'
                  )}
                >
                  {item.icon && item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Items */}
          {rightItems && (
            <div className="flex items-center gap-md">
              {rightItems}
            </div>
          )}

          {/* Mobile Menu */}
          {mobileMenu && (
            <div className="md:hidden">
              {mobileMenu}
            </div>
          )}
        </div>
      </nav>
    )
  }
)

NavBar.displayName = 'NavBar'

export default NavBar
