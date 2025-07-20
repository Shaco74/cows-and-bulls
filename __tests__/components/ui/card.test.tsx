import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card Components', () => {
  test('renders Card component', () => {
    render(<Card data-testid="card">Card content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('rounded-lg', 'border', 'border-gray-200', 'bg-white', 'shadow-sm')
  })

  test('renders CardHeader component', () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>)
    const header = screen.getByTestId('card-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
  })

  test('renders CardTitle component', () => {
    render(<CardTitle data-testid="card-title">Title text</CardTitle>)
    const title = screen.getByTestId('card-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    expect(title.tagName).toBe('H3')
  })

  test('renders CardDescription component', () => {
    render(<CardDescription data-testid="card-description">Description text</CardDescription>)
    const description = screen.getByTestId('card-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm', 'text-gray-500')
    expect(description.tagName).toBe('P')
  })

  test('renders CardContent component', () => {
    render(<CardContent data-testid="card-content">Content text</CardContent>)
    const content = screen.getByTestId('card-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('p-6', 'pt-0')
  })

  test('renders CardFooter component', () => {
    render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
    const footer = screen.getByTestId('card-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
  })

  test('renders complete card structure', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByTestId('complete-card')).toBeInTheDocument()
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Card content goes here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  test('applies custom className to all components', () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle className="custom-title" data-testid="title">Title</CardTitle>
          <CardDescription className="custom-desc" data-testid="desc">Description</CardDescription>
        </CardHeader>
        <CardContent className="custom-content" data-testid="content">Content</CardContent>
        <CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toHaveClass('custom-card')
    expect(screen.getByTestId('header')).toHaveClass('custom-header')
    expect(screen.getByTestId('title')).toHaveClass('custom-title')
    expect(screen.getByTestId('desc')).toHaveClass('custom-desc')
    expect(screen.getByTestId('content')).toHaveClass('custom-content')
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer')
  })

  test('forwards additional props', () => {
    render(<Card id="test-card" role="region">Card with props</Card>)
    const card = screen.getByRole('region')
    expect(card).toHaveAttribute('id', 'test-card')
  })
})