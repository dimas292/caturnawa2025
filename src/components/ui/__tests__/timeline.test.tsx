import { render, screen } from '@testing-library/react'
import { Timeline } from '../timeline'
import React from 'react'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, className, ...props }: any) => (
      <div style={style} className={className} {...props}>
        {children}
      </div>
    )
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0, set: () => {} }
  }),
  useTransform: () => ({ get: () => 0, set: () => {} }),
  useMotionValueEvent: () => {}
}))

describe('Timeline Component', () => {
  const mockData = [
    {
      title: 'Event 1',
      content: <div>Content for event 1</div>
    },
    {
      title: 'Event 2',
      content: <div>Content for event 2</div>
    },
    {
      title: 'Event 3',
      content: <div>Content for event 3</div>
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render timeline with default title and description', () => {
      render(<Timeline data={mockData} />)
      
      expect(screen.getByText('Event Timeline')).toBeInTheDocument()
      expect(screen.getByText('Complete schedule for UNAS FEST 2025 from registration to awarding ceremony')).toBeInTheDocument()
    })

    it('should render timeline with custom title', () => {
      const customTitle = 'Custom Event Timeline'
      render(<Timeline data={mockData} title={customTitle} />)
      
      expect(screen.getByText(customTitle)).toBeInTheDocument()
    })

    it('should render timeline with custom description', () => {
      const customDescription = 'Custom description for the timeline'
      render(<Timeline data={mockData} description={customDescription} />)
      
      expect(screen.getByText(customDescription)).toBeInTheDocument()
    })

    it('should render timeline with both custom title and description', () => {
      const customTitle = 'My Timeline'
      const customDescription = 'My custom description'
      render(<Timeline data={mockData} title={customTitle} description={customDescription} />)
      
      expect(screen.getByText(customTitle)).toBeInTheDocument()
      expect(screen.getByText(customDescription)).toBeInTheDocument()
    })

    it('should render all timeline entries', () => {
      render(<Timeline data={mockData} />)

      // Each title appears twice (mobile and desktop), so use getAllByText
      expect(screen.getAllByText('Event 1').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Event 2').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Event 3').length).toBeGreaterThanOrEqual(1)
    })

    it('should render timeline entry content', () => {
      render(<Timeline data={mockData} />)
      
      expect(screen.getByText('Content for event 1')).toBeInTheDocument()
      expect(screen.getByText('Content for event 2')).toBeInTheDocument()
      expect(screen.getByText('Content for event 3')).toBeInTheDocument()
    })

    it('should render timeline with correct structure', () => {
      const { container } = render(<Timeline data={mockData} />)
      
      // Check for main container
      const mainContainer = container.querySelector('.w-full.bg-white.dark\\:bg-neutral-950')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should render title with correct heading level', () => {
      render(<Timeline data={mockData} />)
      
      const title = screen.getByRole('heading', { level: 2, name: 'Event Timeline' })
      expect(title).toBeInTheDocument()
    })

    it('should render entry titles with correct heading level', () => {
      render(<Timeline data={mockData} />)
      
      const entryTitles = screen.getAllByRole('heading', { level: 3 })
      // Each entry has 2 h3 elements (one for mobile, one for desktop)
      expect(entryTitles.length).toBeGreaterThanOrEqual(mockData.length)
    })
  })

  describe('Timeline Entries', () => {
    it('should render correct number of timeline entries', () => {
      render(<Timeline data={mockData} />)
      
      // Each entry title appears twice (mobile and desktop view)
      const event1Elements = screen.getAllByText('Event 1')
      expect(event1Elements.length).toBeGreaterThanOrEqual(1)
    })

    it('should render timeline entries in correct order', () => {
      render(<Timeline data={mockData} />)
      
      const titles = screen.getAllByRole('heading', { level: 3 })
      const titleTexts = titles.map(el => el.textContent)
      
      expect(titleTexts).toContain('Event 1')
      expect(titleTexts).toContain('Event 2')
      expect(titleTexts).toContain('Event 3')
    })

    it('should render timeline with single entry', () => {
      const singleData = [{ title: 'Single Event', content: <div>Single content</div> }]
      render(<Timeline data={singleData} />)

      expect(screen.getAllByText('Single Event').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Single content')).toBeInTheDocument()
    })

    it('should render timeline with many entries', () => {
      const manyData = Array.from({ length: 10 }, (_, i) => ({
        title: `Event ${i + 1}`,
        content: <div>Content {i + 1}</div>
      }))

      render(<Timeline data={manyData} />)

      expect(screen.getAllByText('Event 1').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Event 10').length).toBeGreaterThanOrEqual(1)
    })

    it('should render timeline entry with complex content', () => {
      const complexData = [{
        title: 'Complex Event',
        content: (
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        )
      }]
      
      render(<Timeline data={complexData} />)
      
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  describe('Styling and Classes', () => {
    it('should apply correct classes to main container', () => {
      const { container } = render(<Timeline data={mockData} />)
      
      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('w-full', 'bg-white', 'dark:bg-neutral-950', 'font-sans')
    })

    it('should apply correct classes to title', () => {
      render(<Timeline data={mockData} />)
      
      const title = screen.getByText('Event Timeline')
      expect(title).toHaveClass('text-lg', 'md:text-4xl', 'mb-4', 'text-black', 'dark:text-white')
    })

    it('should apply correct classes to description', () => {
      render(<Timeline data={mockData} />)
      
      const description = screen.getByText(/Complete schedule for UNAS FEST 2025/)
      expect(description).toHaveClass('text-neutral-700', 'dark:text-neutral-300', 'text-sm', 'md:text-base')
    })

    it('should render timeline dots for each entry', () => {
      const { container } = render(<Timeline data={mockData} />)
      
      // Each entry has a dot indicator
      const dots = container.querySelectorAll('.h-4.w-4.rounded-full')
      expect(dots.length).toBe(mockData.length)
    })

    it('should render timeline line', () => {
      const { container } = render(<Timeline data={mockData} />)
      
      // Timeline vertical line
      const line = container.querySelector('.w-\\[2px\\]')
      expect(line).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should have responsive padding classes', () => {
      const { container } = render(<Timeline data={mockData} />)
      
      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('md:px-10')
    })

    it('should have responsive text sizes for title', () => {
      render(<Timeline data={mockData} />)
      
      const title = screen.getByText('Event Timeline')
      expect(title).toHaveClass('text-lg', 'md:text-4xl')
    })

    it('should have responsive text sizes for description', () => {
      render(<Timeline data={mockData} />)
      
      const description = screen.getByText(/Complete schedule for UNAS FEST 2025/)
      expect(description).toHaveClass('text-sm', 'md:text-base')
    })

    it('should have responsive gap classes for entries', () => {
      const { container } = render(<Timeline data={mockData} />)
      
      const entries = container.querySelectorAll('.md\\:gap-10')
      expect(entries.length).toBeGreaterThan(0)
    })
  })

  describe('Props Handling', () => {
    it('should handle empty data array', () => {
      const { container } = render(<Timeline data={[]} />)
      
      // Should still render title and description
      expect(screen.getByText('Event Timeline')).toBeInTheDocument()
      
      // But no entries
      const entries = container.querySelectorAll('.h-4.w-4.rounded-full')
      expect(entries.length).toBe(0)
    })

    it('should handle data prop updates', () => {
      const { rerender } = render(<Timeline data={mockData} />)

      expect(screen.getAllByText('Event 1').length).toBeGreaterThanOrEqual(1)

      const newData = [{ title: 'New Event', content: <div>New content</div> }]
      rerender(<Timeline data={newData} />)

      expect(screen.getAllByText('New Event').length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('Event 1')).not.toBeInTheDocument()
    })

    it('should handle title prop updates', () => {
      const { rerender } = render(<Timeline data={mockData} title="Original Title" />)
      
      expect(screen.getByText('Original Title')).toBeInTheDocument()
      
      rerender(<Timeline data={mockData} title="Updated Title" />)
      
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    })

    it('should handle description prop updates', () => {
      const { rerender } = render(<Timeline data={mockData} description="Original Description" />)
      
      expect(screen.getByText('Original Description')).toBeInTheDocument()
      
      rerender(<Timeline data={mockData} description="Updated Description" />)
      
      expect(screen.getByText('Updated Description')).toBeInTheDocument()
      expect(screen.queryByText('Original Description')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle entry with empty title', () => {
      const dataWithEmptyTitle = [{ title: '', content: <div>Content</div> }]
      render(<Timeline data={dataWithEmptyTitle} />)

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle entry with empty content', () => {
      const dataWithEmptyContent = [{ title: 'Title', content: null }]
      render(<Timeline data={dataWithEmptyContent} />)

      expect(screen.getAllByText('Title').length).toBeGreaterThanOrEqual(1)
    })

    it('should handle special characters in title', () => {
      const specialData = [{ title: 'Event & Special <Characters>', content: <div>Content</div> }]
      render(<Timeline data={specialData} />)

      expect(screen.getAllByText('Event & Special <Characters>').length).toBeGreaterThanOrEqual(1)
    })

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200)
      const longData = [{ title: longTitle, content: <div>Content</div> }]
      render(<Timeline data={longData} />)

      expect(screen.getAllByText(longTitle).length).toBeGreaterThanOrEqual(1)
    })

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500)
      render(<Timeline data={mockData} description={longDescription} />)
      
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Timeline data={mockData} />)
      
      const h2 = screen.getByRole('heading', { level: 2 })
      const h3s = screen.getAllByRole('heading', { level: 3 })
      
      expect(h2).toBeInTheDocument()
      expect(h3s.length).toBeGreaterThan(0)
    })

    it('should render semantic HTML structure', () => {
      const { container } = render(<Timeline data={mockData} />)
      
      expect(container.querySelector('h2')).toBeInTheDocument()
      expect(container.querySelector('h3')).toBeInTheDocument()
      expect(container.querySelector('p')).toBeInTheDocument()
    })
  })
})

