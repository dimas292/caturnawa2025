import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:8008'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  details?: any
}

const results: TestResult[] = []

function addResult(name: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  results.push({ name, status, message, details })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} ${name}: ${message}`)
  if (details) {
    console.log(`   Details:`, JSON.stringify(details, null, 2))
  }
}

async function testEndpoint(
  name: string,
  url: string,
  expectedStatus: number,
  options?: RequestInit
) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options)
    const status = response.status
    
    if (status === expectedStatus) {
      addResult(name, 'PASS', `Returned ${status} as expected`)
      return { success: true, status, data: null }
    } else {
      const text = await response.text()
      addResult(name, 'FAIL', `Expected ${expectedStatus}, got ${status}`, { response: text.substring(0, 200) })
      return { success: false, status, data: text }
    }
  } catch (error: any) {
    addResult(name, 'FAIL', `Request failed: ${error.message}`)
    return { success: false, status: 0, data: null }
  }
}

async function testPublicEndpoints() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 2.1: PUBLIC ENDPOINTS (No Auth Required)')
  console.log('='.repeat(70) + '\n')

  // Test 1: Homepage
  console.log('Test 1: Homepage')
  await testEndpoint('GET /', '/', 200)

  // Test 2: Auth signin page
  console.log('\nTest 2: Auth signin page')
  await testEndpoint('GET /auth/signin', '/auth/signin', 200)

  // Test 3: Auth signup page
  console.log('\nTest 3: Auth signup page')
  await testEndpoint('GET /auth/signup', '/auth/signup', 200)

  // Test 4: Competitions page
  console.log('\nTest 4: Competitions page')
  await testEndpoint('GET /competitions', '/competitions', 200)

  // Test 5: Public leaderboard API
  console.log('\nTest 5: Public leaderboard API')
  const leaderboardResult = await testEndpoint('GET /api/public/leaderboard', '/api/public/leaderboard', 200)
  
  // Test 6: Public results API
  console.log('\nTest 6: Public comprehensive results API')
  await testEndpoint('GET /api/public/comprehensive-results', '/api/public/comprehensive-results', 200)
}

async function testAuthenticationEndpoints() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 2.2: AUTHENTICATION ENDPOINTS')
  console.log('='.repeat(70) + '\n')

  // Test 7: Session endpoint (unauthenticated)
  console.log('Test 7: Session endpoint without auth')
  await testEndpoint('GET /api/auth/session (no auth)', '/api/auth/session', 200)

  // Test 8: Protected admin endpoint redirects
  console.log('\nTest 8: Protected admin endpoint (should redirect)')
  const adminResult = await testEndpoint(
    'GET /api/admin/kdbi/round-teams (no auth)',
    '/api/admin/kdbi/round-teams?stage=PRELIMINARY&round=1&session=1',
    307 // Temporary redirect to login
  )

  // Test 9: Protected judge endpoint redirects
  console.log('\nTest 9: Protected judge endpoint (should redirect)')
  await testEndpoint(
    'GET /api/judge/matches (no auth)',
    '/api/judge/matches',
    307
  )

  // Test 10: Protected participant endpoint redirects
  console.log('\nTest 10: Protected participant endpoint (should redirect)')
  await testEndpoint(
    'GET /api/participant/profile (no auth)',
    '/api/participant/profile',
    307
  )
}

async function testAdminEndpoints() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 2.3: ADMIN ENDPOINTS (Without Auth - Expect Redirects)')
  console.log('='.repeat(70) + '\n')

  // Test 11: KDBI round-teams endpoint
  console.log('Test 11: KDBI round-teams endpoint')
  await testEndpoint(
    'GET /api/admin/kdbi/round-teams',
    '/api/admin/kdbi/round-teams?stage=PRELIMINARY&round=1&session=1',
    307
  )

  // Test 12: EDC round-teams endpoint
  console.log('\nTest 12: EDC round-teams endpoint')
  await testEndpoint(
    'GET /api/admin/edc/round-teams',
    '/api/admin/edc/round-teams?stage=PRELIMINARY&round=1&session=1',
    307
  )

  // Test 13: Create KDBI rounds endpoint
  console.log('\nTest 13: Create all KDBI rounds endpoint')
  await testEndpoint(
    'POST /api/admin/create-all-kdbi-rounds',
    '/api/admin/create-all-kdbi-rounds',
    307,
    { method: 'POST' }
  )

  // Test 14: Frozen rounds toggle endpoint
  console.log('\nTest 14: Toggle frozen round endpoint')
  await testEndpoint(
    'POST /api/admin/debate/toggle-frozen-round',
    '/api/admin/debate/toggle-frozen-round',
    307,
    { method: 'POST' }
  )

  // Test 15: KDBI rooms endpoint
  console.log('\nTest 15: KDBI rooms endpoint (POST)')
  await testEndpoint(
    'POST /api/admin/kdbi/rooms',
    '/api/admin/kdbi/rooms',
    307,
    { method: 'POST' }
  )
}

async function testDashboardPages() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 2.4: DASHBOARD PAGES (Without Auth - Expect Redirects)')
  console.log('='.repeat(70) + '\n')

  // Test 16: Admin dashboard
  console.log('Test 16: Admin dashboard page')
  await testEndpoint('GET /dashboard/admin', '/dashboard/admin', 307)

  // Test 17: Admin KDBI pairing page
  console.log('\nTest 17: Admin KDBI pairing page')
  await testEndpoint('GET /dashboard/admin/kdbi/pairing', '/dashboard/admin/kdbi/pairing', 307)

  // Test 18: Admin frozen rounds page
  console.log('\nTest 18: Admin frozen rounds page')
  await testEndpoint('GET /dashboard/admin/frozen-rounds', '/dashboard/admin/frozen-rounds', 307)

  // Test 19: Judge dashboard
  console.log('\nTest 19: Judge dashboard page')
  await testEndpoint('GET /dashboard/judge', '/dashboard/judge', 307)

  // Test 20: Participant dashboard
  console.log('\nTest 20: Participant dashboard page')
  await testEndpoint('GET /dashboard', '/dashboard', 307)
}

async function testAPIResponseStructure() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 2.5: API RESPONSE STRUCTURE')
  console.log('='.repeat(70) + '\n')

  // Test 21: Leaderboard response structure
  console.log('Test 21: Leaderboard API response structure')
  try {
    const response = await fetch(`${BASE_URL}/api/public/leaderboard`)
    const data = await response.json()
    
    if (Array.isArray(data)) {
      addResult('Leaderboard structure', 'PASS', 'Returns array as expected', { count: data.length })
    } else {
      addResult('Leaderboard structure', 'FAIL', 'Expected array, got different structure', { type: typeof data })
    }
  } catch (error: any) {
    addResult('Leaderboard structure', 'FAIL', `Error parsing response: ${error.message}`)
  }

  // Test 22: Comprehensive results response structure
  console.log('\nTest 22: Comprehensive results API response structure')
  try {
    const response = await fetch(`${BASE_URL}/api/public/comprehensive-results`)
    const data = await response.json()
    
    if (data && typeof data === 'object') {
      addResult('Results structure', 'PASS', 'Returns object as expected', { 
        hasKDBI: 'KDBI' in data,
        hasEDC: 'EDC' in data
      })
    } else {
      addResult('Results structure', 'FAIL', 'Unexpected response structure', { type: typeof data })
    }
  } catch (error: any) {
    addResult('Results structure', 'FAIL', `Error parsing response: ${error.message}`)
  }

  // Test 23: Session endpoint response
  console.log('\nTest 23: Session endpoint response structure')
  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`)
    const data = await response.json()
    
    // Unauthenticated session should return null or empty object
    if (data === null || (typeof data === 'object' && Object.keys(data).length === 0)) {
      addResult('Session structure', 'PASS', 'Returns null/empty for unauthenticated user')
    } else {
      addResult('Session structure', 'WARN', 'Unexpected session data', { data })
    }
  } catch (error: any) {
    addResult('Session structure', 'FAIL', `Error parsing response: ${error.message}`)
  }
}

async function testErrorHandling() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 2.6: ERROR HANDLING')
  console.log('='.repeat(70) + '\n')

  // Test 24: 404 for non-existent page
  console.log('Test 24: 404 for non-existent page')
  await testEndpoint('GET /non-existent-page', '/non-existent-page-that-does-not-exist', 404)

  // Test 25: Invalid API endpoint
  console.log('\nTest 25: 404 for invalid API endpoint')
  await testEndpoint('GET /api/invalid', '/api/invalid-endpoint-test', 404)

  // Test 26: Invalid query parameters
  console.log('\nTest 26: Admin endpoint with invalid parameters')
  const invalidResult = await testEndpoint(
    'GET /api/admin/kdbi/round-teams (invalid params)',
    '/api/admin/kdbi/round-teams?stage=INVALID&round=999&session=999',
    307 // Still redirects to auth, doesn't validate params before auth
  )
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('PHASE 2: BACKEND API TESTING - SUMMARY REPORT')
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

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
  }

  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
  }

  console.log('\n' + '='.repeat(70))
  
  return { passed, failed, warned, total, results }
}

async function main() {
  console.log('🧪 COMPREHENSIVE API ENDPOINT TESTING')
  console.log('Starting Phase 2: Backend API Testing...\n')

  await testPublicEndpoints()
  await testAuthenticationEndpoints()
  await testAdminEndpoints()
  await testDashboardPages()
  await testAPIResponseStructure()
  await testErrorHandling()
  
  const report = await generateReport()
  
  // Exit with error code if tests failed
  if (report.failed > 0) {
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

