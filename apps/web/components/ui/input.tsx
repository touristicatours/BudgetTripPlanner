import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  errorText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    error = false,
    leftIcon,
    rightIcon,
    label,
    helperText,
    errorText,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="flex flex-col gap-sm">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-fg"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-md top-1/2 transform -translate-y-1/2 text-fg-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              leftIcon && 'pl-xl',
              rightIcon && 'pr-xl',
              error && 'input-error',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-md top-1/2 transform -translate-y-1/2 text-fg-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {(helperText || errorText) && (
          <p className={cn(
            'text-xs',
            error ? 'text-error' : 'text-muted'
          )}>
            {error ? errorText : helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
