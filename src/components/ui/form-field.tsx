'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { Input } from './input'

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  showRequiredIndicator?: boolean
}

/**
 * Form Field Component with validation feedback
 * Provides consistent styling and error handling for form inputs
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      hint,
      required,
      showRequiredIndicator = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substring(7)}`
    const hasError = Boolean(error)

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={fieldId} className={cn(hasError && 'text-destructive')}>
            {label}
            {required && showRequiredIndicator && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </Label>
        )}
        
        <Input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />

        {hint && !error && (
          <p
            id={`${fieldId}-hint`}
            className="text-sm text-muted-foreground"
          >
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${fieldId}-error`}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
          >
            <span aria-hidden="true">⚠️</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

/**
 * Textarea variant of FormField
 */
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  showRequiredIndicator?: boolean
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      hint,
      required,
      showRequiredIndicator = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substring(7)}`
    const hasError = Boolean(error)

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={fieldId} className={cn(hasError && 'text-destructive')}>
            {label}
            {required && showRequiredIndicator && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </Label>
        )}
        
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />

        {hint && !error && (
          <p
            id={`${fieldId}-hint`}
            className="text-sm text-muted-foreground"
          >
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${fieldId}-error`}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
          >
            <span aria-hidden="true">⚠️</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

/**
 * Form validation helper
 */
export function validateField(
  value: string,
  rules: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: string) => boolean | string
  }
): string | undefined {
  if (rules.required && !value.trim()) {
    return 'This field is required'
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum length is ${rules.minLength} characters`
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Maximum length is ${rules.maxLength} characters`
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format'
  }

  if (rules.custom) {
    const result = rules.custom(value)
    if (typeof result === 'string') {
      return result
    }
    if (result === false) {
      return 'Invalid value'
    }
  }

  return undefined
}

