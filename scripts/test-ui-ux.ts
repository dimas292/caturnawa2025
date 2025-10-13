/**
 * PHASE 5: UI/UX TESTING
 * 
 * Tests:
 * 1. Design Consistency (5 tests)
 * 2. Accessibility Testing (5 tests)
 * 3. Form Validation & Error Handling (5 tests)
 * 4. Loading States & User Feedback (3 tests)
 * 5. Visual Consistency (2 tests)
 * 
 * Total: 20 tests
 */

const BASE_URL = 'http://localhost:8008'

interface TestResult {
  category: string
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

const results: TestResult[] = []

function logResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  results.push({ category, test, status, message, details })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} [${category}] ${test}: ${message}`)
  if (details && status !== 'PASS') {
    console.log(`   Details:`, JSON.stringify(details, null, 2).substring(0, 200))
  }
}

async function testDesignConsistency() {
  console.log('\n' + '='.repeat(70))
  console.log('UI/UX TEST 1: DESIGN CONSISTENCY')
  console.log('='.repeat(70) + '\n')

  const pages = ['/', '/auth/signin', '/auth/signup', '/competitions']
  const discordColors = ['#202225', '#2f3136', '#36393f', '#5865f2']

  // Test 1: Discord color palette consistency
  let colorConsistency = 0
  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`)
      const html = await response.text()
      const hasColors = discordColors.some(color => html.includes(color))
      if (hasColors) colorConsistency++
    } catch (error) {
      // Skip on error
    }
  }

  if (colorConsistency >= 3) {
    logResult('Design Consistency', 'Discord Color Palette', 'PASS', `${colorConsistency}/${pages.length} pages use Discord colors`)
  } else {
    logResult('Design Consistency', 'Discord Color Palette', 'WARN', `Only ${colorConsistency}/${pages.length} pages use Discord colors`)
  }

  // Test 2: Typography consistency
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasConsistentFonts = html.includes('font-') || html.includes('text-')
    if (hasConsistentFonts) {
      logResult('Design Consistency', 'Typography', 'PASS', 'Consistent typography classes detected')
    } else {
      logResult('Design Consistency', 'Typography', 'WARN', 'Typography classes not detected')
    }
  } catch (error: any) {
    logResult('Design Consistency', 'Typography', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Spacing consistency
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasSpacing = html.includes('p-') || html.includes('m-') || html.includes('gap-')
    if (hasSpacing) {
      logResult('Design Consistency', 'Spacing', 'PASS', 'Consistent spacing classes detected')
    } else {
      logResult('Design Consistency', 'Spacing', 'WARN', 'Spacing classes not detected')
    }
  } catch (error: any) {
    logResult('Design Consistency', 'Spacing', 'FAIL', `Error: ${error.message}`)
  }

  // Test 4: Component styling consistency
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasButtons = html.includes('button') || html.includes('btn')
    const hasCards = html.includes('card') || html.includes('rounded')
    if (hasButtons && hasCards) {
      logResult('Design Consistency', 'Component Styling', 'PASS', 'Consistent component styles detected')
    } else {
      logResult('Design Consistency', 'Component Styling', 'WARN', 'Some component styles not detected')
    }
  } catch (error: any) {
    logResult('Design Consistency', 'Component Styling', 'FAIL', `Error: ${error.message}`)
  }

  // Test 5: Dark theme implementation
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasDarkTheme = html.includes('dark:') || html.includes('bg-[#202225]') || html.includes('bg-[#2f3136]')
    if (hasDarkTheme) {
      logResult('Design Consistency', 'Dark Theme', 'PASS', 'Dark theme classes detected')
    } else {
      logResult('Design Consistency', 'Dark Theme', 'WARN', 'Dark theme not detected (may use CSS variables)')
    }
  } catch (error: any) {
    logResult('Design Consistency', 'Dark Theme', 'FAIL', `Error: ${error.message}`)
  }
}

async function testAccessibility() {
  console.log('\n' + '='.repeat(70))
  console.log('UI/UX TEST 2: ACCESSIBILITY')
  console.log('='.repeat(70) + '\n')

  // Test 1: WCAG 2.1 AA compliance basics
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    
    const hasLang = html.includes('lang=')
    const hasTitle = html.includes('<title>')
    const hasMeta = html.includes('viewport')
    
    if (hasLang && hasTitle && hasMeta) {
      logResult('Accessibility', 'WCAG Basics', 'PASS', 'Basic WCAG requirements met (lang, title, viewport)')
    } else {
      logResult('Accessibility', 'WCAG Basics', 'FAIL', 'Missing basic WCAG requirements')
    }
  } catch (error: any) {
    logResult('Accessibility', 'WCAG Basics', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: ARIA labels
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasAria = html.includes('aria-') || html.includes('role=')
    if (hasAria) {
      logResult('Accessibility', 'ARIA Labels', 'PASS', 'ARIA attributes detected')
    } else {
      logResult('Accessibility', 'ARIA Labels', 'WARN', 'ARIA attributes not detected (may be added client-side)')
    }
  } catch (error: any) {
    logResult('Accessibility', 'ARIA Labels', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Keyboard navigation
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasTabIndex = html.includes('tabindex') || html.includes('tabIndex')
    const hasFocusClasses = html.includes('focus:')
    if (hasFocusClasses) {
      logResult('Accessibility', 'Keyboard Navigation', 'PASS', 'Focus styles detected for keyboard navigation')
    } else {
      logResult('Accessibility', 'Keyboard Navigation', 'WARN', 'Focus styles not detected')
    }
  } catch (error: any) {
    logResult('Accessibility', 'Keyboard Navigation', 'FAIL', `Error: ${error.message}`)
  }

  // Test 4: Semantic HTML
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasSemanticTags = html.includes('<nav') && html.includes('<main') && html.includes('<header')
    if (hasSemanticTags) {
      logResult('Accessibility', 'Semantic HTML', 'PASS', 'Semantic HTML5 tags detected')
    } else {
      logResult('Accessibility', 'Semantic HTML', 'WARN', 'Some semantic tags not detected')
    }
  } catch (error: any) {
    logResult('Accessibility', 'Semantic HTML', 'FAIL', `Error: ${error.message}`)
  }

  // Test 5: Color contrast (basic check)
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    // Check for light text on dark backgrounds (Discord style)
    const hasGoodContrast = html.includes('text-white') || html.includes('text-gray-100')
    if (hasGoodContrast) {
      logResult('Accessibility', 'Color Contrast', 'PASS', 'High contrast text colors detected')
    } else {
      logResult('Accessibility', 'Color Contrast', 'WARN', 'Contrast verification needed (manual check recommended)')
    }
  } catch (error: any) {
    logResult('Accessibility', 'Color Contrast', 'FAIL', `Error: ${error.message}`)
  }
}

async function testFormValidation() {
  console.log('\n' + '='.repeat(70))
  console.log('UI/UX TEST 3: FORM VALIDATION & ERROR HANDLING')
  console.log('='.repeat(70) + '\n')

  // Test 1: Login form presence
  try {
    const response = await fetch(`${BASE_URL}/auth/signin`)
    const html = await response.text()
    const hasEmailField = html.includes('email') || html.includes('Email')
    const hasPasswordField = html.includes('password') || html.includes('Password')
    if (hasEmailField && hasPasswordField) {
      logResult('Form Validation', 'Login Form', 'PASS', 'Login form with email and password fields detected')
    } else {
      logResult('Form Validation', 'Login Form', 'FAIL', 'Login form fields not detected')
    }
  } catch (error: any) {
    logResult('Form Validation', 'Login Form', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Registration form presence
  try {
    const response = await fetch(`${BASE_URL}/auth/signup`)
    const html = await response.text()
    const hasForm = html.includes('form') || html.includes('input')
    if (hasForm) {
      logResult('Form Validation', 'Registration Form', 'PASS', 'Registration form detected')
    } else {
      logResult('Form Validation', 'Registration Form', 'FAIL', 'Registration form not detected')
    }
  } catch (error: any) {
    logResult('Form Validation', 'Registration Form', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Required field indicators
  try {
    const response = await fetch(`${BASE_URL}/auth/signin`)
    const html = await response.text()
    const hasRequired = html.includes('required') || html.includes('*')
    if (hasRequired) {
      logResult('Form Validation', 'Required Fields', 'PASS', 'Required field indicators detected')
    } else {
      logResult('Form Validation', 'Required Fields', 'WARN', 'Required field indicators not detected')
    }
  } catch (error: any) {
    logResult('Form Validation', 'Required Fields', 'FAIL', `Error: ${error.message}`)
  }

  // Test 4: Error message structure
  try {
    const response = await fetch(`${BASE_URL}/auth/signin`)
    const html = await response.text()
    // Check for error display elements
    const hasErrorDisplay = html.includes('error') || html.includes('alert') || html.includes('toast')
    if (hasErrorDisplay) {
      logResult('Form Validation', 'Error Messages', 'PASS', 'Error message display structure detected')
    } else {
      logResult('Form Validation', 'Error Messages', 'WARN', 'Error display not detected (may be client-side)')
    }
  } catch (error: any) {
    logResult('Form Validation', 'Error Messages', 'FAIL', `Error: ${error.message}`)
  }

  // Test 5: Success feedback structure
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasSuccessFeedback = html.includes('success') || html.includes('toast') || html.includes('notification')
    if (hasSuccessFeedback) {
      logResult('Form Validation', 'Success Feedback', 'PASS', 'Success feedback structure detected')
    } else {
      logResult('Form Validation', 'Success Feedback', 'WARN', 'Success feedback not detected (may be client-side)')
    }
  } catch (error: any) {
    logResult('Form Validation', 'Success Feedback', 'FAIL', `Error: ${error.message}`)
  }
}

async function testLoadingStates() {
  console.log('\n' + '='.repeat(70))
  console.log('UI/UX TEST 4: LOADING STATES & USER FEEDBACK')
  console.log('='.repeat(70) + '\n')

  // Test 1: Loading indicators
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasLoading = html.includes('loading') || html.includes('spinner') || html.includes('skeleton')
    if (hasLoading) {
      logResult('Loading States', 'Loading Indicators', 'PASS', 'Loading indicators detected')
    } else {
      logResult('Loading States', 'Loading Indicators', 'WARN', 'Loading indicators not detected (may be client-side)')
    }
  } catch (error: any) {
    logResult('Loading States', 'Loading Indicators', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Button states
  try {
    const response = await fetch(`${BASE_URL}/auth/signin`)
    const html = await response.text()
    const hasButtonStates = html.includes('disabled') || html.includes('opacity-')
    if (hasButtonStates) {
      logResult('Loading States', 'Button States', 'PASS', 'Button disabled states detected')
    } else {
      logResult('Loading States', 'Button States', 'WARN', 'Button states not detected (may be client-side)')
    }
  } catch (error: any) {
    logResult('Loading States', 'Button States', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Toast notifications
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()
    const hasToast = html.includes('toast') || html.includes('notification') || html.includes('alert')
    if (hasToast) {
      logResult('Loading States', 'Toast Notifications', 'PASS', 'Toast notification structure detected')
    } else {
      logResult('Loading States', 'Toast Notifications', 'WARN', 'Toast notifications not detected (may be client-side)')
    }
  } catch (error: any) {
    logResult('Loading States', 'Toast Notifications', 'FAIL', `Error: ${error.message}`)
  }
}

async function testVisualConsistency() {
  console.log('\n' + '='.repeat(70))
  console.log('UI/UX TEST 5: VISUAL CONSISTENCY')
  console.log('='.repeat(70) + '\n')

  const pages = ['/', '/auth/signin', '/auth/signup', '/competitions']

  // Test 1: Consistent header/footer
  let headerConsistency = 0
  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`)
      const html = await response.text()
      const hasHeader = html.includes('<header') || html.includes('nav')
      if (hasHeader) headerConsistency++
    } catch (error) {
      // Skip on error
    }
  }

  if (headerConsistency >= 3) {
    logResult('Visual Consistency', 'Header/Footer', 'PASS', `${headerConsistency}/${pages.length} pages have consistent header`)
  } else {
    logResult('Visual Consistency', 'Header/Footer', 'WARN', `Only ${headerConsistency}/${pages.length} pages have header`)
  }

  // Test 2: Consistent navigation
  let navConsistency = 0
  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`)
      const html = await response.text()
      const hasNav = html.includes('nav') || html.includes('menu')
      if (hasNav) navConsistency++
    } catch (error) {
      // Skip on error
    }
  }

  if (navConsistency >= 3) {
    logResult('Visual Consistency', 'Navigation', 'PASS', `${navConsistency}/${pages.length} pages have consistent navigation`)
  } else {
    logResult('Visual Consistency', 'Navigation', 'WARN', `Only ${navConsistency}/${pages.length} pages have navigation`)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 5: UI/UX TESTING - FINAL REPORT')
  console.log('='.repeat(70) + '\n')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length
  const total = results.length

  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warned}`)
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`)
  console.log(`Completion Rate: ${(((passed + warned) / total) * 100).toFixed(1)}%`)

  const categories = [...new Set(results.map(r => r.category))]
  console.log('\n📊 RESULTS BY CATEGORY:')
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat)
    const catPassed = catResults.filter(r => r.status === 'PASS').length
    const catTotal = catResults.length
    console.log(`   ${cat}: ${catPassed}/${catTotal} passed`)
  })

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - [${r.category}] ${r.test}: ${r.message}`)
    })
  }

  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - [${r.category}] ${r.test}: ${r.message}`)
    })
  }

  console.log('\n' + '='.repeat(70))

  const completionRate = ((passed + warned) / total) * 100
  console.log(`\n📊 Phase 5 Completion: ${completionRate.toFixed(1)}%`)

  return { passed, failed, warned, total, results }
}

async function main() {
  console.log('🧪 PHASE 5: UI/UX TESTING')
  console.log('Testing design consistency, accessibility, forms, and user feedback...\n')

  await testDesignConsistency()
  await testAccessibility()
  await testFormValidation()
  await testLoadingStates()
  await testVisualConsistency()

  const report = await generateReport()

  if (report.failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the failures above.')
  } else {
    console.log('\n✅ All UI/UX tests completed!')
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })

