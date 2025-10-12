import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '../textarea'

describe('Textarea Component', () => {
  it('should render textarea element', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('should accept and display value', async () => {
    const user = userEvent.setup()
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement

    await user.type(textarea, 'Test content')
    expect(textarea.value).toBe('Test content')
  })

  it('should handle onChange events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    render(<Textarea data-testid="textarea" onChange={handleChange} />)
    const textarea = screen.getByTestId('textarea')

    await user.type(textarea, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeDisabled()
  })

  it('should display placeholder text', () => {
    render(<Textarea placeholder="Enter text here" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('placeholder', 'Enter text here')
  })

  it('should apply custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('custom-class')
  })

  it('should support controlled textarea', async () => {
    const user = userEvent.setup()
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      return (
        <Textarea
          data-testid="textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )
    }

    render(<TestComponent />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement

    await user.type(textarea, 'Controlled')
    expect(textarea.value).toBe('Controlled')
  })

  it('should support uncontrolled textarea with defaultValue', () => {
    render(<Textarea defaultValue="Default text" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('Default text')
  })

  it('should support required attribute', () => {
    render(<Textarea required data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeRequired()
  })

  it('should support maxLength attribute', async () => {
    const user = userEvent.setup()
    render(<Textarea maxLength={10} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement

    await user.type(textarea, '12345678901234567890')
    expect(textarea.value.length).toBeLessThanOrEqual(10)
  })

  it('should support readOnly attribute', async () => {
    const user = userEvent.setup()
    render(<Textarea readOnly value="Read only" data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement

    await user.type(textarea, 'Try to type')
    expect(textarea.value).toBe('Read only')
  })

  it('should support rows attribute', () => {
    render(<Textarea rows={5} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('rows', '5')
  })
})

// Add React import for controlled component test
import React from 'react'

