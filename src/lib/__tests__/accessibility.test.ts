import {
  generateA11yId,
  announceToScreenReader,
  isFocusable,
  getFocusableElements,
  trapFocus,
  FocusManager,
  prefersReducedMotion,
  prefersDarkMode,
  getAriaLabel,
  KeyboardKeys,
  isActivationKey,
  LiveRegion,
  SR_ONLY_CLASS,
} from '../accessibility'

describe('Accessibility Utilities', () => {
  describe('generateA11yId', () => {
    it('should generate unique ID with default prefix', () => {
      const id1 = generateA11yId()
      const id2 = generateA11yId()
      
      expect(id1).toMatch(/^a11y-/)
      expect(id2).toMatch(/^a11y-/)
      expect(id1).not.toBe(id2)
    })

    it('should generate unique ID with custom prefix', () => {
      const id = generateA11yId('custom')
      expect(id).toMatch(/^custom-/)
    })
  })

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
      jest.clearAllTimers()
    })

    it('should create announcement element', () => {
      announceToScreenReader('Test message')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toBeTruthy()
      expect(announcement?.textContent).toBe('Test message')
    })

    it('should use polite priority by default', () => {
      announceToScreenReader('Test message')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement?.getAttribute('aria-live')).toBe('polite')
    })

    it('should use assertive priority when specified', () => {
      announceToScreenReader('Urgent message', 'assertive')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement?.getAttribute('aria-live')).toBe('assertive')
    })

    it('should remove announcement after timeout', () => {
      jest.useFakeTimers()

      announceToScreenReader('Test message')

      let announcement = document.querySelector('[role="status"]')
      expect(announcement).toBeTruthy()

      // Fast-forward time by 1000ms
      jest.advanceTimersByTime(1000)

      announcement = document.querySelector('[role="status"]')
      expect(announcement).toBeNull()

      jest.useRealTimers()
    })

    it('should have sr-only class', () => {
      announceToScreenReader('Test message')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement?.className).toBe('sr-only')
    })

    it('should have aria-atomic attribute', () => {
      announceToScreenReader('Test message')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement?.getAttribute('aria-atomic')).toBe('true')
    })
  })

  describe('isFocusable', () => {
    it('should return true for button element', () => {
      const button = document.createElement('button')
      expect(isFocusable(button)).toBe(true)
    })

    it('should return true for link with href', () => {
      const link = document.createElement('a')
      link.href = '#'
      expect(isFocusable(link)).toBe(true)
    })

    it('should return true for input element', () => {
      const input = document.createElement('input')
      expect(isFocusable(input)).toBe(true)
    })

    it('should return false for disabled button', () => {
      const button = document.createElement('button')
      button.disabled = true
      expect(isFocusable(button)).toBe(false)
    })

    it('should return false for element with negative tabindex', () => {
      const div = document.createElement('div')
      div.tabIndex = -1
      expect(isFocusable(div)).toBe(false)
    })

    it('should return false for aria-hidden element', () => {
      const button = document.createElement('button')
      button.setAttribute('aria-hidden', 'true')
      expect(isFocusable(button)).toBe(false)
    })

    it('should return true for element with tabindex 0', () => {
      const div = document.createElement('div')
      div.tabIndex = 0
      expect(isFocusable(div)).toBe(true)
    })
  })

  describe('getFocusableElements', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    it('should find all focusable elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <button disabled>Disabled</button>
        <div tabindex="0">Focusable div</div>
      `
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(4) // button, link, input, div (not disabled button)
    })

    it('should exclude aria-hidden elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button>Visible</button>
        <button aria-hidden="true">Hidden</button>
      `
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(1)
    })
  })

  describe('trapFocus', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    it('should focus first element on initialization', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `
      document.body.appendChild(container)

      const cleanup = trapFocus(container)

      expect(document.activeElement?.id).toBe('first')

      cleanup()
      document.body.removeChild(container)
    })

    it('should trap focus on Tab key', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `
      document.body.appendChild(container)

      const cleanup = trapFocus(container)

      // Focus last element
      const lastButton = document.getElementById('third') as HTMLButtonElement
      lastButton.focus()
      expect(document.activeElement?.id).toBe('third')

      // Press Tab (should cycle to first)
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      container.dispatchEvent(tabEvent)

      // Note: preventDefault in real scenario, but in test we check the handler was called
      expect(document.activeElement?.id).toBe('first')

      cleanup()
      document.body.removeChild(container)
    })

    it('should trap focus on Shift+Tab key', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="third">Third</button>
      `
      document.body.appendChild(container)

      const cleanup = trapFocus(container)

      // First element is already focused
      expect(document.activeElement?.id).toBe('first')

      // Press Shift+Tab (should cycle to last)
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true
      })
      container.dispatchEvent(shiftTabEvent)

      expect(document.activeElement?.id).toBe('third')

      cleanup()
      document.body.removeChild(container)
    })

    it('should not trap focus on non-Tab keys', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `
      document.body.appendChild(container)

      const cleanup = trapFocus(container)

      const firstButton = document.getElementById('first') as HTMLButtonElement
      firstButton.focus()

      // Press Enter (should not affect focus)
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      container.dispatchEvent(enterEvent)

      expect(document.activeElement?.id).toBe('first')

      cleanup()
      document.body.removeChild(container)
    })

    it('should remove event listener on cleanup', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `
      document.body.appendChild(container)

      const cleanup = trapFocus(container)
      cleanup()

      // After cleanup, Tab should not trap focus
      const lastButton = document.getElementById('second') as HTMLButtonElement
      lastButton.focus()

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      container.dispatchEvent(tabEvent)

      // Focus should not change (no trapping)
      expect(document.activeElement?.id).toBe('second')

      document.body.removeChild(container)
    })

    it('should handle container with no focusable elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `<div>No focusable elements</div>`
      document.body.appendChild(container)

      const cleanup = trapFocus(container)

      // Should not throw error
      expect(() => {
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
        container.dispatchEvent(tabEvent)
      }).not.toThrow()

      cleanup()
      document.body.removeChild(container)
    })
  })

  describe('FocusManager', () => {
    it('should save and restore focus', () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      const manager = new FocusManager()
      manager.save()

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      expect(document.activeElement).toBe(input)

      manager.restore()
      expect(document.activeElement).toBe(button)

      document.body.removeChild(button)
      document.body.removeChild(input)
    })

    it('should handle restore when no focus was saved', () => {
      const manager = new FocusManager()

      // Should not throw error
      expect(() => manager.restore()).not.toThrow()
    })

    it('should handle restore when previous element has no focus method', () => {
      const manager = new FocusManager()
      manager.save()

      // Manually set previousFocus to an element without focus method
      ;(manager as any).previousFocus = { focus: undefined }

      // Should not throw error
      expect(() => manager.restore()).not.toThrow()
    })

    it('should clear previousFocus after restore', () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()

      const manager = new FocusManager()
      manager.save()

      manager.restore()

      // previousFocus should be null after restore
      expect((manager as any).previousFocus).toBeNull()

      document.body.removeChild(button)
    })
  })

  describe('prefersReducedMotion', () => {
    it('should return true when user prefers reduced motion', () => {
      // Mock matchMedia to return matches: true
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      expect(prefersReducedMotion()).toBe(true)
    })

    it('should return false when user does not prefer reduced motion', () => {
      // Mock matchMedia to return matches: false
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      expect(prefersReducedMotion()).toBe(false)
    })
  })

  describe('prefersDarkMode', () => {
    it('should return true when user prefers dark mode', () => {
      // Mock matchMedia to return matches: true
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      expect(prefersDarkMode()).toBe(true)
    })

    it('should return false when user does not prefer dark mode', () => {
      // Mock matchMedia to return matches: false
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      expect(prefersDarkMode()).toBe(false)
    })
  })

  describe('getAriaLabel', () => {
    it('should get aria-label', () => {
      const element = document.createElement('button')
      element.setAttribute('aria-label', 'Close')
      expect(getAriaLabel(element)).toBe('Close')
    })

    it('should get aria-labelledby', () => {
      const element = document.createElement('button')
      element.setAttribute('aria-labelledby', 'label-id')
      expect(getAriaLabel(element)).toBe('label-id')
    })

    it('should get title', () => {
      const element = document.createElement('button')
      element.setAttribute('title', 'Button title')
      expect(getAriaLabel(element)).toBe('Button title')
    })

    it('should return null if no label found', () => {
      const element = document.createElement('button')
      expect(getAriaLabel(element)).toBeNull()
    })

    it('should prioritize aria-label over title', () => {
      const element = document.createElement('button')
      element.setAttribute('aria-label', 'ARIA Label')
      element.setAttribute('title', 'Title')
      expect(getAriaLabel(element)).toBe('ARIA Label')
    })
  })

  describe('KeyboardKeys', () => {
    it('should have correct key values', () => {
      expect(KeyboardKeys.ENTER).toBe('Enter')
      expect(KeyboardKeys.SPACE).toBe(' ')
      expect(KeyboardKeys.ESCAPE).toBe('Escape')
      expect(KeyboardKeys.TAB).toBe('Tab')
      expect(KeyboardKeys.ARROW_UP).toBe('ArrowUp')
      expect(KeyboardKeys.ARROW_DOWN).toBe('ArrowDown')
      expect(KeyboardKeys.ARROW_LEFT).toBe('ArrowLeft')
      expect(KeyboardKeys.ARROW_RIGHT).toBe('ArrowRight')
      expect(KeyboardKeys.HOME).toBe('Home')
      expect(KeyboardKeys.END).toBe('End')
      expect(KeyboardKeys.PAGE_UP).toBe('PageUp')
      expect(KeyboardKeys.PAGE_DOWN).toBe('PageDown')
    })
  })

  describe('isActivationKey', () => {
    it('should return true for Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      expect(isActivationKey(event)).toBe(true)
    })

    it('should return true for Space key', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' })
      expect(isActivationKey(event)).toBe(true)
    })

    it('should return false for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      expect(isActivationKey(event)).toBe(false)
    })
  })

  describe('LiveRegion', () => {
    beforeEach(() => {
      // Clean up any existing live regions
      document.querySelectorAll('[role="status"]').forEach(el => el.remove())
    })

    afterEach(() => {
      // Clean up after each test
      document.querySelectorAll('[role="status"]').forEach(el => el.remove())
    })

    it('should create live region element', () => {
      const region = new LiveRegion()

      const element = document.querySelector('[role="status"]')
      expect(element).toBeTruthy()
      expect(element?.getAttribute('aria-live')).toBe('polite')

      region.destroy()
    })

    it('should announce messages', () => {
      const region = new LiveRegion()

      region.announce('Test announcement')

      const element = document.querySelector('[role="status"]')
      expect(element?.textContent).toBe('Test announcement')

      region.destroy()
    })

    it('should use assertive priority when specified', () => {
      const region = new LiveRegion('assertive')

      const element = document.querySelector('[role="status"]')
      expect(element?.getAttribute('aria-live')).toBe('assertive')

      region.destroy()
    })

    it('should clean up on destroy', () => {
      const region = new LiveRegion()
      region.destroy()

      const element = document.querySelector('[role="status"]')
      expect(element).toBeNull()
    })

    it('should not throw when announcing after destroy', () => {
      const region = new LiveRegion()
      region.destroy()

      // Should not throw error
      expect(() => region.announce('Test')).not.toThrow()
    })

    it('should not throw when destroying twice', () => {
      const region = new LiveRegion()
      region.destroy()

      // Should not throw error on second destroy
      expect(() => region.destroy()).not.toThrow()
    })

    it('should have sr-only class', () => {
      const region = new LiveRegion()

      const element = document.querySelector('[role="status"]')
      expect(element?.className).toBe('sr-only')

      region.destroy()
    })

    it('should have aria-atomic attribute', () => {
      const region = new LiveRegion()

      const element = document.querySelector('[role="status"]')
      expect(element?.getAttribute('aria-atomic')).toBe('true')

      region.destroy()
    })
  })

  describe('SR_ONLY_CLASS', () => {
    it('should have correct class name', () => {
      expect(SR_ONLY_CLASS).toBe('sr-only')
    })
  })
})

