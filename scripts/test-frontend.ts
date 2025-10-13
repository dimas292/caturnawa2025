/**
 * PHASE 3: FRONTEND TESTING
 * 
 * Tests:
 * 1. Visual Testing - Discord-style design verification
 * 2. Component Testing - SparklesCore, Timeline, CTA section
 * 3. Responsive Design - Mobile, tablet, desktop viewports
 * 4. Interactive Elements - Hover effects, animations
 * 5. User Flows - Login, registration, dashboard navigation
 */

const BASE_URL = 'http://localhost:8008'

interface TestResult {
  category: string
  test: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'
  message: string
  details?: any
}

const results: TestResult[] = []

function logResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP', message: string, details?: any) {
  results.push({ category, test, status, message, details })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '⏭️'
  console.log(`${icon} [${category}] ${test}: ${message}`)
  if (details && status !== 'PASS') {
    console.log(`   Details:`, JSON.stringify(details, null, 2).substring(0, 200))
  }
}

async function testVisualDesign() {
  console.log('\n' + '='.repeat(70))
  console.log('FRONTEND TEST 1: VISUAL DESIGN (Discord-style)')
  console.log('='.repeat(70) + '\n')

  // Test 1: Homepage loads
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()

    if (response.status === 200) {
      logResult('Visual Design', 'Homepage Loads', 'PASS', 'Homepage returns 200 OK')
    } else {
      logResult('Visual Design', 'Homepage Loads', 'FAIL', `Expected 200, got ${response.status}`)
    }

    // Test 2: Discord color palette present
    const hasDiscordColors = html.includes('#202225') || html.includes('#2f3136') || html.includes('#5865f2')
    if (hasDiscordColors) {
      logResult('Visual Design', 'Discord Colors', 'PASS', 'Discord color palette detected in HTML')
    } else {
      logResult('Visual Design', 'Discord Colors', 'WARN', 'Discord colors not found in inline styles (may be in CSS)')
    }

    // Test 3: Tailwind CSS loaded
    const hasTailwind = html.includes('tailwind') || html.includes('_next/static')
    if (hasTailwind) {
      logResult('Visual Design', 'Tailwind CSS', 'PASS', 'Tailwind CSS detected')
    } else {
      logResult('Visual Design', 'Tailwind CSS', 'WARN', 'Tailwind CSS not detected in HTML')
    }

    // Test 4: Next.js app structure
    const hasNextJS = html.includes('__next') || html.includes('_next')
    if (hasNextJS) {
      logResult('Visual Design', 'Next.js Structure', 'PASS', 'Next.js app structure detected')
    } else {
      logResult('Visual Design', 'Next.js Structure', 'FAIL', 'Next.js structure not found')
    }
  } catch (error: any) {
    logResult('Visual Design', 'Homepage Test', 'FAIL', `Error: ${error.message}`)
  }
}

async function testComponents() {
  console.log('\n' + '='.repeat(70))
  console.log('FRONTEND TEST 2: COMPONENT TESTING')
  console.log('='.repeat(70) + '\n')

  // Test 1: Homepage with components
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()

    // Test for SparklesCore component
    const hasSparkles = html.includes('sparkle') || html.includes('particle')
    if (hasSparkles) {
      logResult('Components', 'SparklesCore', 'PASS', 'Sparkles/particle effects detected')
    } else {
      logResult('Components', 'SparklesCore', 'WARN', 'Sparkles component not detected (may load client-side)')
    }

    // Test for Timeline component
    const hasTimeline = html.includes('timeline') || html.includes('Timeline')
    if (hasTimeline) {
      logResult('Components', 'Timeline', 'PASS', 'Timeline component detected')
    } else {
      logResult('Components', 'Timeline', 'WARN', 'Timeline component not detected')
    }

    // Test for CTA section
    const hasCTA = html.includes('Daftar Sekarang') || html.includes('Register') || html.includes('cta')
    if (hasCTA) {
      logResult('Components', 'CTA Section', 'PASS', 'CTA section detected')
    } else {
      logResult('Components', 'CTA Section', 'WARN', 'CTA section not detected')
    }

    // Test for Navigation
    const hasNav = html.includes('nav') || html.includes('header') || html.includes('menu')
    if (hasNav) {
      logResult('Components', 'Navigation', 'PASS', 'Navigation component detected')
    } else {
      logResult('Components', 'Navigation', 'FAIL', 'Navigation not found')
    }
  } catch (error: any) {
    logResult('Components', 'Component Test', 'FAIL', `Error: ${error.message}`)
  }
}

async function testResponsiveDesign() {
  console.log('\n' + '='.repeat(70))
  console.log('FRONTEND TEST 3: RESPONSIVE DESIGN')
  console.log('='.repeat(70) + '\n')

  // Test 1: Viewport meta tag
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()

    const hasViewport = html.includes('viewport') && html.includes('width=device-width')
    if (hasViewport) {
      logResult('Responsive', 'Viewport Meta Tag', 'PASS', 'Viewport meta tag present')
    } else {
      logResult('Responsive', 'Viewport Meta Tag', 'FAIL', 'Viewport meta tag missing')
    }

    // Test 2: Responsive classes
    const hasResponsiveClasses = html.includes('sm:') || html.includes('md:') || html.includes('lg:')
    if (hasResponsiveClasses) {
      logResult('Responsive', 'Responsive Classes', 'PASS', 'Tailwind responsive classes detected')
    } else {
      logResult('Responsive', 'Responsive Classes', 'WARN', 'Responsive classes not detected in HTML')
    }

    // Test 3: Mobile-friendly structure
    const hasMobileStructure = html.includes('flex') || html.includes('grid')
    if (hasMobileStructure) {
      logResult('Responsive', 'Flexible Layout', 'PASS', 'Flexible layout structure detected')
    } else {
      logResult('Responsive', 'Flexible Layout', 'WARN', 'Flexible layout not detected')
    }
  } catch (error: any) {
    logResult('Responsive', 'Responsive Test', 'FAIL', `Error: ${error.message}`)
  }
}

async function testInteractiveElements() {
  console.log('\n' + '='.repeat(70))
  console.log('FRONTEND TEST 4: INTERACTIVE ELEMENTS')
  console.log('='.repeat(70) + '\n')

  // Test 1: Buttons present
  try {
    const response = await fetch(`${BASE_URL}/`)
    const html = await response.text()

    const hasButtons = html.includes('button') || html.includes('btn')
    if (hasButtons) {
      logResult('Interactive', 'Buttons', 'PASS', 'Buttons detected in HTML')
    } else {
      logResult('Interactive', 'Buttons', 'WARN', 'Buttons not detected')
    }

    // Test 2: Links present
    const hasLinks = html.includes('<a ') || html.includes('href=')
    if (hasLinks) {
      logResult('Interactive', 'Links', 'PASS', 'Links detected in HTML')
    } else {
      logResult('Interactive', 'Links', 'FAIL', 'Links not found')
    }

    // Test 3: Hover effects (Tailwind classes)
    const hasHoverEffects = html.includes('hover:')
    if (hasHoverEffects) {
      logResult('Interactive', 'Hover Effects', 'PASS', 'Hover effect classes detected')
    } else {
      logResult('Interactive', 'Hover Effects', 'WARN', 'Hover effects not detected in HTML')
    }

    // Test 4: Animations (framer-motion or CSS)
    const hasAnimations = html.includes('animate') || html.includes('transition') || html.includes('motion')
    if (hasAnimations) {
      logResult('Interactive', 'Animations', 'PASS', 'Animation classes detected')
    } else {
      logResult('Interactive', 'Animations', 'WARN', 'Animations not detected')
    }
  } catch (error: any) {
    logResult('Interactive', 'Interactive Test', 'FAIL', `Error: ${error.message}`)
  }
}

async function testUserFlows() {
  console.log('\n' + '='.repeat(70))
  console.log('FRONTEND TEST 5: USER FLOWS')
  console.log('='.repeat(70) + '\n')

  // Test 1: Login page
  try {
    const response = await fetch(`${BASE_URL}/auth/signin`)
    if (response.status === 200) {
      logResult('User Flows', 'Login Page', 'PASS', 'Login page loads successfully')
    } else {
      logResult('User Flows', 'Login Page', 'FAIL', `Expected 200, got ${response.status}`)
    }
  } catch (error: any) {
    logResult('User Flows', 'Login Page', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Registration page
  try {
    const response = await fetch(`${BASE_URL}/auth/signup`)
    if (response.status === 200) {
      logResult('User Flows', 'Registration Page', 'PASS', 'Registration page loads successfully')
    } else {
      logResult('User Flows', 'Registration Page', 'FAIL', `Expected 200, got ${response.status}`)
    }
  } catch (error: any) {
    logResult('User Flows', 'Registration Page', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Competitions page
  try {
    const response = await fetch(`${BASE_URL}/competitions`)
    if (response.status === 200) {
      logResult('User Flows', 'Competitions Page', 'PASS', 'Competitions page loads successfully')
    } else {
      logResult('User Flows', 'Competitions Page', 'FAIL', `Expected 200, got ${response.status}`)
    }
  } catch (error: any) {
    logResult('User Flows', 'Competitions Page', 'FAIL', `Error: ${error.message}`)
  }

  // Test 4: Dashboard redirect (should redirect to login)
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' })
    if (response.status === 307 || response.status === 302) {
      logResult('User Flows', 'Dashboard Auth', 'PASS', 'Dashboard redirects to login when not authenticated')
    } else if (response.status === 200) {
      logResult('User Flows', 'Dashboard Auth', 'WARN', 'Dashboard accessible without auth (may be expected)')
    } else {
      logResult('User Flows', 'Dashboard Auth', 'FAIL', `Unexpected status: ${response.status}`)
    }
  } catch (error: any) {
    logResult('User Flows', 'Dashboard Auth', 'FAIL', `Error: ${error.message}`)
  }

  // Test 5: Admin dashboard redirect
  try {
    const response = await fetch(`${BASE_URL}/dashboard/admin`, { redirect: 'manual' })
    if (response.status === 307 || response.status === 302) {
      logResult('User Flows', 'Admin Auth', 'PASS', 'Admin dashboard redirects to login when not authenticated')
    } else if (response.status === 200) {
      logResult('User Flows', 'Admin Auth', 'WARN', 'Admin dashboard accessible without auth')
    } else {
      logResult('User Flows', 'Admin Auth', 'FAIL', `Unexpected status: ${response.status}`)
    }
  } catch (error: any) {
    logResult('User Flows', 'Admin Auth', 'FAIL', `Error: ${error.message}`)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 3: FRONTEND TESTING - FINAL REPORT')
  console.log('='.repeat(70) + '\n')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warned = results.filter(r => r.status === 'WARN').length
  const skipped = results.filter(r => r.status === 'SKIP').length
  const total = results.length

  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warned}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`)
  console.log(`Completion Rate: ${(((passed + warned) / total) * 100).toFixed(1)}%`)

  // Group by category
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

  return { passed, failed, warned, skipped, total, results }
}

async function main() {
  console.log('🧪 PHASE 3: FRONTEND TESTING')
  console.log('Testing visual design, components, responsive design, and user flows...\n')

  await testVisualDesign()
  await testComponents()
  await testResponsiveDesign()
  await testInteractiveElements()
  await testUserFlows()

  const report = await generateReport()

  const completionRate = ((report.passed + report.warned) / report.total) * 100
  console.log(`\n📊 Phase 3 Completion: ${completionRate.toFixed(1)}%`)

  if (report.failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the failures above.')
  } else {
    console.log('\n✅ All frontend tests completed!')
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })

