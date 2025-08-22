import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'avatar' | 'button' | 'card' | 'custom'
  lines?: number
  width?: string | number
  height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'text',
    lines = 1,
    width,
    height,
    style,
    ...props 
  }, ref) => {
    const baseClasses = 'skeleton'
    const variantClasses = {
      text: 'skeleton-text',
      avatar: 'skeleton-avatar',
      button: 'skeleton-button',
      card: 'skeleton-card'
    }

    const skeletonStyle = {
      width: width,
      height: height,
      ...style
    }

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className="flex flex-col gap-sm" {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                variantClasses[variant],
                className
              )}
              style={skeletonStyle}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        style={skeletonStyle}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export default Skeleton
