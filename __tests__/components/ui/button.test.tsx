import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  test('applies default variant classes', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'text-white')
  })

  test('applies variant-specific classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600', 'text-white')
  })

  test('applies outline variant classes', () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-gray-300', 'bg-white')
  })

  test('applies size-specific classes', () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-9')
  })

  test('applies large size classes', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-11')
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('can be disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('forwards additional props', () => {
    render(<Button data-testid="custom-button" type="submit">Submit</Button>)
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  test('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-gray-100')
  })

  test('applies link variant classes', () => {
    render(<Button variant="link">Link Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-blue-600', 'underline-offset-4')
  })

  test('applies icon size classes', () => {
    render(<Button size="icon">+</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10')
  })
})