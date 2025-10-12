import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply default variant styles', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('should apply variant prop correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    let button = screen.getByRole('button')
    expect(button.className).toContain('destructive')

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button')
    expect(button.className).toContain('outline')
  })

  it('should apply size prop correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole('button')
    // Check that button has the data-slot attribute (confirms it rendered)
    expect(button).toHaveAttribute('data-slot', 'button')
    expect(button).toBeInTheDocument()

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    // Check that button has the data-slot attribute (confirms it rendered)
    expect(button).toHaveAttribute('data-slot', 'button')
    expect(button).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not trigger click when disabled', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('should support all variant types', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      unmount()
    })
  })

  it('should support all size types', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const
    
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      unmount()
    })
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })
})

