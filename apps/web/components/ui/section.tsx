import React from 'react'
import { cn } from '@/lib/utils'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  container?: boolean
  containerSize?: 'sm' | 'md' | 'lg'
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ 
    className, 
    size = 'md',
    container = true,
    containerSize = 'md',
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'section-sm',
      md: 'section',
      lg: 'section-lg'
    }

    const containerClasses = {
      sm: 'container-sm',
      md: 'container',
      lg: 'container-lg'
    }

    const content = container ? (
      <div className={containerClasses[containerSize]}>
        {children}
      </div>
    ) : children

    return (
      <section
        ref={ref}
        className={cn(
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {content}
      </section>
    )
  }
)

Section.displayName = 'Section'

export default Section
