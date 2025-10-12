import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should accept and display value', async () => {
    const user = userEvent.setup()
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('should handle onChange events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should apply type prop correctly', () => {
    const { rerender } = render(<Input type="email" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    input = screen.getByDisplayValue('') || document.querySelector('input[type="password"]')!
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should display placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('custom-input')
  })

  it('should have data-slot attribute', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  it('should support controlled input', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      return (
        <Input 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-input"
        />
      )
    }

    const user = userEvent.setup()
    render(<TestComponent />)
    const input = screen.getByTestId('controlled-input')
    
    await user.type(input, 'controlled')
    expect(input).toHaveValue('controlled')
  })

  it('should support uncontrolled input with defaultValue', () => {
    render(<Input defaultValue="default text" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default text')
  })

  it('should support required attribute', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('should support maxLength attribute', async () => {
    const user = userEvent.setup()
    render(<Input maxLength={5} />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, '1234567890')
    expect(input).toHaveValue('12345')
  })

  it('should support readOnly attribute', async () => {
    const user = userEvent.setup()
    render(<Input readOnly value="readonly" />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'test')
    expect(input).toHaveValue('readonly')
  })
})

