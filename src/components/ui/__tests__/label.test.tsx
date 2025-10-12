import { render, screen } from '@testing-library/react'
import { Label } from '../label'

describe('Label Component', () => {
  it('should render label with text', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render as label element', () => {
    render(<Label data-testid="label">Label</Label>)
    const label = screen.getByTestId('label')
    expect(label.tagName).toBe('LABEL')
  })

  it('should accept htmlFor attribute', () => {
    render(<Label htmlFor="input-id" data-testid="label">Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('should apply custom className', () => {
    render(<Label className="custom-label" data-testid="label">Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('custom-label')
  })

  it('should render children correctly', () => {
    render(
      <Label>
        <span>Required</span> Field
      </Label>
    )
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText(/Field/)).toBeInTheDocument()
  })

  it('should work with input element', () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Input</Label>
        <input id="test-input" type="text" />
      </div>
    )
    const label = screen.getByText('Test Input')
    expect(label).toHaveAttribute('for', 'test-input')
  })
})

