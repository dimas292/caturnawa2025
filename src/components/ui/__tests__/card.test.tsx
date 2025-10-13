import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card element', () => {
      render(<Card data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('should render children', () => {
      render(<Card>Test content</Card>)
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(<CardTitle>Test Title</CardTitle>)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should have card-title data-slot', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(<CardDescription>Test description</CardDescription>)
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should have card-description data-slot', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveAttribute('data-slot', 'card-description')
    })

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="desc">Desc</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('should render card content', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('CardAction', () => {
    it('should render card action', () => {
      render(<CardAction data-testid="action">Action</CardAction>)
      const action = screen.getByTestId('action')
      expect(action).toBeInTheDocument()
    })

    it('should have card-action data-slot', () => {
      render(<CardAction data-testid="action">Action</CardAction>)
      const action = screen.getByTestId('action')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })

    it('should apply custom className', () => {
      render(<CardAction className="custom-action" data-testid="action">Action</CardAction>)
      const action = screen.getByTestId('action')
      expect(action).toHaveClass('custom-action')
    })

    it('should render children correctly', () => {
      render(
        <CardAction>
          <button>Edit</button>
        </CardAction>
      )
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })

  describe('Complete Card', () => {
    it('should render complete card with all parts', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
      expect(screen.getByText('Card Footer')).toBeInTheDocument()
    })

    it('should render card with action button', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardDescription>Description</CardDescription>
            <CardAction>
              <button>Edit</button>
            </CardAction>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      expect(screen.getByText('Card with Action')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })
})
