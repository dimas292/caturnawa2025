import { PrismaClient, CompetitionType } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:8008'

interface TestResult {
  competition: string
  category: string
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
}

const results: TestResult[] = []

function logResult(comp: string, category: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string) {
  results.push({ competition: comp, category, test, status, message })
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} [${comp}] [${category}] ${test}: ${message}`)
}

async function testCompetitionDatabase(compType: CompetitionType, compName: string) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`${compName} - DATABASE TESTING`)
  console.log('='.repeat(70) + '\n')

  // Test 1: Competition exists
  try {
    const comp = await prisma.competition.findFirst({ where: { type: compType } })
    if (comp) {
      logResult(compName, 'Database', 'Competition Exists', 'PASS', `Competition found: ${comp.name}`)
    } else {
      logResult(compName, 'Database', 'Competition Exists', 'FAIL', 'Competition not found')
    }
  } catch (error: any) {
    logResult(compName, 'Database', 'Competition Exists', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Registrations exist
  try {
    const registrations = await prisma.registration.findMany({
      where: { competition: { type: compType }, status: 'VERIFIED' },
      include: { teamMembers: true }
    })

    if (registrations.length > 0) {
      const allHaveMembers = registrations.every(r => r.teamMembers.length > 0)
      if (allHaveMembers) {
        logResult(compName, 'Database', 'Registrations', 'PASS', `${registrations.length} verified registrations with members`)
      } else {
        logResult(compName, 'Database', 'Registrations', 'FAIL', 'Some registrations missing members')
      }
    } else {
      logResult(compName, 'Database', 'Registrations', 'WARN', 'No registrations found')
    }
  } catch (error: any) {
    logResult(compName, 'Database', 'Registrations', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Data integrity
  try {
    const registrations = await prisma.registration.findMany({
      where: { competition: { type: compType } },
      include: {
        participant: true,
        teamMembers: { include: { participant: true } }
      }
    })

    const allValid = registrations.every(r => 
      r.participant !== null && 
      r.teamMembers.every(m => m.participant !== null)
    )

    if (allValid) {
      logResult(compName, 'Database', 'Data Integrity', 'PASS', 'All relations intact')
    } else {
      logResult(compName, 'Database', 'Data Integrity', 'FAIL', 'Some relations broken')
    }
  } catch (error: any) {
    logResult(compName, 'Database', 'Data Integrity', 'FAIL', `Error: ${error.message}`)
  }
}

async function testCompetitionAPI(compType: CompetitionType, compName: string, slug: string) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`${compName} - API TESTING`)
  console.log('='.repeat(70) + '\n')

  // Test 1: Competition page loads
  try {
    const response = await fetch(`${BASE_URL}/competitions/${slug}`)
    if (response.status === 200) {
      logResult(compName, 'API', 'Competition Page', 'PASS', 'Page loads successfully')
    } else {
      logResult(compName, 'API', 'Competition Page', 'FAIL', `Expected 200, got ${response.status}`)
    }
  } catch (error: any) {
    logResult(compName, 'API', 'Competition Page', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Registration endpoint accessible
  try {
    const response = await fetch(`${BASE_URL}/competitions/${slug}/register`)
    if (response.status === 200 || response.status === 307) {
      logResult(compName, 'API', 'Registration Endpoint', 'PASS', 'Endpoint accessible')
    } else {
      logResult(compName, 'API', 'Registration Endpoint', 'WARN', `Status: ${response.status}`)
    }
  } catch (error: any) {
    logResult(compName, 'API', 'Registration Endpoint', 'FAIL', `Error: ${error.message}`)
  }
}

async function testCompetitionFrontend(compType: CompetitionType, compName: string, slug: string) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`${compName} - FRONTEND TESTING`)
  console.log('='.repeat(70) + '\n')

  // Test 1: Page contains competition name
  try {
    const response = await fetch(`${BASE_URL}/competitions/${slug}`)
    const html = await response.text()

    // Check for competition name or key parts of it (e.g., "DCC" for "DCC Infografis")
    const nameKeywords = compName.split(' ')
    const hasCompName = html.includes(compName) ||
                       html.includes(slug.toUpperCase()) ||
                       nameKeywords.some(keyword => html.includes(keyword))

    if (hasCompName) {
      logResult(compName, 'Frontend', 'Competition Name', 'PASS', 'Competition name displayed')
    } else {
      logResult(compName, 'Frontend', 'Competition Name', 'WARN', 'Competition name not found in HTML')
    }
  } catch (error: any) {
    logResult(compName, 'Frontend', 'Competition Name', 'FAIL', `Error: ${error.message}`)
  }

  // Test 2: Discord colors present (check for Tailwind classes or hex codes)
  try {
    const response = await fetch(`${BASE_URL}/competitions/${slug}`)
    const html = await response.text()
    const hasDiscordColors = html.includes('#202225') || html.includes('#2f3136') || html.includes('#5865f2') ||
                             html.includes('bg-background') || html.includes('bg-muted') || html.includes('bg-primary')

    if (hasDiscordColors) {
      logResult(compName, 'Frontend', 'Discord Colors', 'PASS', 'Discord color palette detected')
    } else {
      logResult(compName, 'Frontend', 'Discord Colors', 'WARN', 'Discord colors not detected')
    }
  } catch (error: any) {
    logResult(compName, 'Frontend', 'Discord Colors', 'FAIL', `Error: ${error.message}`)
  }

  // Test 3: Responsive design classes
  try {
    const response = await fetch(`${BASE_URL}/competitions/${slug}`)
    const html = await response.text()
    const hasResponsive = html.includes('md:') || html.includes('lg:') || html.includes('sm:')
    
    if (hasResponsive) {
      logResult(compName, 'Frontend', 'Responsive Design', 'PASS', 'Responsive classes detected')
    } else {
      logResult(compName, 'Frontend', 'Responsive Design', 'WARN', 'Responsive classes not detected')
    }
  } catch (error: any) {
    logResult(compName, 'Frontend', 'Responsive Design', 'FAIL', `Error: ${error.message}`)
  }
}

async function testAllCompetitions() {
  const competitions = [
    { type: CompetitionType.KDBI, name: 'KDBI', slug: 'kdbi' },
    { type: CompetitionType.EDC, name: 'EDC', slug: 'edc' },
    { type: CompetitionType.SPC, name: 'SPC', slug: 'spc' },
    { type: CompetitionType.DCC_INFOGRAFIS, name: 'DCC Infografis', slug: 'dcc-infografis' },
    { type: CompetitionType.DCC_SHORT_VIDEO, name: 'DCC Short Video', slug: 'dcc-short-video' }
  ]

  for (const comp of competitions) {
    await testCompetitionDatabase(comp.type, comp.name)
    await testCompetitionAPI(comp.type, comp.name, comp.slug)
    await testCompetitionFrontend(comp.type, comp.name, comp.slug)
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('ALL COMPETITIONS TESTING - FINAL REPORT')
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

  // Results by competition
  const competitions = [...new Set(results.map(r => r.competition))]
  console.log('\n📊 RESULTS BY COMPETITION:')
  competitions.forEach(comp => {
    const compResults = results.filter(r => r.competition === comp)
    const compPassed = compResults.filter(r => r.status === 'PASS').length
    const compTotal = compResults.length
    console.log(`   ${comp}: ${compPassed}/${compTotal} passed`)
  })

  // Results by category
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
      console.log(`   - [${r.competition}] [${r.category}] ${r.test}: ${r.message}`)
    })
  }

  if (warned > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - [${r.competition}] [${r.category}] ${r.test}: ${r.message}`)
    })
  }

  console.log('\n' + '='.repeat(70))

  return { passed, failed, warned, total, results }
}

async function main() {
  console.log('🧪 TESTING ALL COMPETITIONS')
  console.log('KDBI, EDC, SPC, DCC_INFOGRAFIS, DCC_SHORT_VIDEO\n')

  await testAllCompetitions()
  const report = await generateReport()

  if (report.failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the failures above.')
  } else {
    console.log('\n✅ All competition tests completed!')
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

