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
  })

  describe('SR_ONLY_CLASS', () => {
    it('should have correct class name', () => {
      expect(SR_ONLY_CLASS).toBe('sr-only')
    })
  })
})

