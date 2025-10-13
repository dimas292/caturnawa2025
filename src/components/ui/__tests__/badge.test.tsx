import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '../badge'

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should apply default variant', () => {
    render(<Badge data-testid="badge">Default</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
  })

  it('should apply destructive variant', () => {
    render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
  })

  it('should apply outline variant', () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
  })

  it('should apply secondary variant', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<Badge className="custom-class" data-testid="badge">Custom</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('should render as span element', () => {
    render(<Badge data-testid="badge">Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('should support all variant types', () => {
    const { rerender } = render(<Badge variant="default" data-testid="badge">Badge</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()

    rerender(<Badge variant="destructive" data-testid="badge">Badge</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()

    rerender(<Badge variant="outline" data-testid="badge">Badge</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()

    rerender(<Badge variant="secondary" data-testid="badge">Badge</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('should render children correctly', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test" data-testid="badge-link">Link Badge</a>
      </Badge>
    )
    const badge = screen.getByTestId('badge-link')
    expect(badge.tagName).toBe('A')
    expect(badge).toHaveAttribute('href', '/test')
  })

  it('should render as span when asChild is false', () => {
    render(<Badge asChild={false} data-testid="badge">Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('should have data-slot attribute', () => {
    render(<Badge data-testid="badge">Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  it('should pass through additional props', () => {
    render(<Badge data-testid="badge" aria-label="Test Badge" id="test-badge">Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('aria-label', 'Test Badge')
    expect(badge).toHaveAttribute('id', 'test-badge')
  })

  it('should export badgeVariants', () => {
    expect(badgeVariants).toBeDefined()
    expect(typeof badgeVariants).toBe('function')
  })

  it('should generate correct classes with badgeVariants', () => {
    const defaultClasses = badgeVariants({ variant: 'default' })
    expect(defaultClasses).toContain('inline-flex')

    const destructiveClasses = badgeVariants({ variant: 'destructive' })
    expect(destructiveClasses).toContain('inline-flex')
  })
})
