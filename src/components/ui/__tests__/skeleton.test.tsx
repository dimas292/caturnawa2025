import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonForm,
  SkeletonList,
} from '../skeleton'

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('should render skeleton element', () => {
      const { container } = render(<Skeleton data-testid="skeleton" />)
      const skeleton = container.querySelector('[data-testid="skeleton"]')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="custom-class" data-testid="skeleton" />)
      const skeleton = container.querySelector('[data-testid="skeleton"]')
      expect(skeleton).toHaveClass('custom-class')
    })
  })

  describe('SkeletonText', () => {
    it('should render text skeleton', () => {
      const { container } = render(<SkeletonText data-testid="text" />)
      const text = container.querySelector('[data-testid="text"]')
      expect(text).toBeInTheDocument()
      expect(text).toHaveClass('h-4')
    })
  })

  describe('SkeletonTitle', () => {
    it('should render title skeleton', () => {
      const { container } = render(<SkeletonTitle data-testid="title" />)
      const title = container.querySelector('[data-testid="title"]')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('h-8')
    })
  })

  describe('SkeletonAvatar', () => {
    it('should render avatar skeleton', () => {
      const { container } = render(<SkeletonAvatar data-testid="avatar" />)
      const avatar = container.querySelector('[data-testid="avatar"]')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('rounded-full')
    })
  })

  describe('SkeletonButton', () => {
    it('should render button skeleton', () => {
      const { container } = render(<SkeletonButton data-testid="button" />)
      const button = container.querySelector('[data-testid="button"]')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('h-10')
    })
  })

  describe('SkeletonCard', () => {
    it('should render card skeleton with multiple elements', () => {
      const { container } = render(<SkeletonCard />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(1)
    })
  })

  describe('SkeletonTable', () => {
    it('should render table skeleton with default rows and columns', () => {
      const { container } = render(<SkeletonTable />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      // Default: 5 rows + 1 header = 6 rows, 4 columns each = 24 skeletons
      expect(skeletons.length).toBe(24)
    })

    it('should render table skeleton with custom rows', () => {
      const { container } = render(<SkeletonTable rows={3} columns={2} />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      // 3 rows + 1 header = 4 rows, 2 columns each = 8 skeletons
      expect(skeletons.length).toBe(8)
    })
  })

  describe('SkeletonForm', () => {
    it('should render form skeleton with multiple fields', () => {
      const { container } = render(<SkeletonForm />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(3)
    })
  })

  describe('SkeletonList', () => {
    it('should render list skeleton with default items', () => {
      const { container } = render(<SkeletonList />)
      const items = container.querySelectorAll('.flex.items-center')
      expect(items.length).toBe(5) // Default 5 items
    })

    it('should render list skeleton with custom items', () => {
      const { container } = render(<SkeletonList items={3} />)
      const items = container.querySelectorAll('.flex.items-center')
      expect(items.length).toBe(3)
    })
  })
})

