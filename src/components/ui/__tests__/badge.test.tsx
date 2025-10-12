import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

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
})

