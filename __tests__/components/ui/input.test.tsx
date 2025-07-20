import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  test('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  test('applies default classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-gray-300',
      'bg-white',
      'px-3',
      'py-2'
    )
  })

  test('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'test value' })
    }))
  })

  test('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  test('accepts different input types', () => {
    render(<Input type="email" data-testid="email-input" />)
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('type', 'email')
  })

  test('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
  })

  test('forwards additional props', () => {
    render(<Input maxLength={10} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  test('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  test('shows placeholder text', () => {
    render(<Input placeholder="Type here..." />)
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
  })

  test('accepts controlled value', () => {
    const { rerender } = render(<Input value="initial" onChange={() => {}} />)
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument()
    
    rerender(<Input value="updated" onChange={() => {}} />)
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
  })
})