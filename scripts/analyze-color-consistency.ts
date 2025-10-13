/**
 * DISCORD COLOR CONSISTENCY ANALYSIS
 * 
 * Analyzes all pages for Discord color palette usage and identifies inconsistencies
 */

const BASE_URL = 'http://localhost:8008'

interface ColorAnalysis {
  page: string
  url: string
  hasDiscordColors: boolean
  colors: {
    darkest: boolean    // #202225
    secondary: boolean  // #2f3136
    tertiary: boolean   // #36393f
    blurple: boolean    // #5865f2
  }
  issues: string[]
}

const results: ColorAnalysis[] = []

const DISCORD_COLORS = {
  darkest: '#202225',
  secondary: '#2f3136',
  tertiary: '#36393f',
  blurple: '#5865f2'
}

async function analyzePage(name: string, url: string) {
  console.log(`\n🔍 Analyzing: ${name}`)
  console.log(`   URL: ${url}`)

  try {
    const response = await fetch(url)
    const html = await response.text()

    const analysis: ColorAnalysis = {
      page: name,
      url,
      hasDiscordColors: false,
      colors: {
        darkest: html.includes(DISCORD_COLORS.darkest),
        secondary: html.includes(DISCORD_COLORS.secondary),
        tertiary: html.includes(DISCORD_COLORS.tertiary),
        blurple: html.includes(DISCORD_COLORS.blurple)
      },
      issues: []
    }

    // Check if any Discord colors are present
    analysis.hasDiscordColors = Object.values(analysis.colors).some(v => v)

    // Identify issues
    if (!analysis.hasDiscordColors) {
      analysis.issues.push('No Discord colors detected in HTML')
    }

    // Check for background color consistency
    const bgPatterns = [
      /bg-\[#[0-9a-f]{6}\]/gi,
      /background-color:\s*#[0-9a-f]{6}/gi,
      /backgroundColor:\s*["']#[0-9a-f]{6}["']/gi
    ]

    const foundColors = new Set<string>()
    bgPatterns.forEach(pattern => {
      const matches = html.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const colorMatch = match.match(/#[0-9a-f]{6}/i)
          if (colorMatch) {
            foundColors.add(colorMatch[0].toLowerCase())
          }
        })
      }
    })

    if (foundColors.size > 0) {
      console.log(`   Found ${foundColors.size} unique background colors:`)
      foundColors.forEach(color => {
        const isDiscord = Object.values(DISCORD_COLORS).includes(color)
        console.log(`   ${isDiscord ? '✅' : '⚠️ '} ${color}`)
      })
    }

    results.push(analysis)

    // Summary
    const colorCount = Object.values(analysis.colors).filter(v => v).length
    if (colorCount === 0) {
      console.log(`   ⚠️  Status: No Discord colors detected (may be client-side)`)
    } else {
      console.log(`   ✅ Status: ${colorCount}/4 Discord colors detected`)
    }

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`)
    results.push({
      page: name,
      url,
      hasDiscordColors: false,
      colors: { darkest: false, secondary: false, tertiary: false, blurple: false },
      issues: [`Error fetching page: ${error.message}`]
    })
  }
}

async function analyzeAllPages() {
  console.log('=' .repeat(70))
  console.log('DISCORD COLOR CONSISTENCY ANALYSIS')
  console.log('='.repeat(70))

  const pages = [
    { name: 'Homepage', url: `${BASE_URL}/` },
    { name: 'Competitions', url: `${BASE_URL}/competitions` },
    { name: 'KDBI', url: `${BASE_URL}/competitions/kdbi` },
    { name: 'EDC', url: `${BASE_URL}/competitions/edc` },
    { name: 'SPC', url: `${BASE_URL}/competitions/spc` },
    { name: 'Sign In', url: `${BASE_URL}/auth/signin` },
    { name: 'Sign Up', url: `${BASE_URL}/auth/signup` },
    { name: 'Dashboard', url: `${BASE_URL}/dashboard` }
  ]

  for (const page of pages) {
    await analyzePage(page.name, page.url)
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(70))
  console.log('COLOR CONSISTENCY REPORT')
  console.log('='.repeat(70) + '\n')

  const pagesWithColors = results.filter(r => r.hasDiscordColors).length
  const totalPages = results.length

  console.log(`📊 SUMMARY:`)
  console.log(`   Total Pages Analyzed: ${totalPages}`)
  console.log(`   Pages with Discord Colors: ${pagesWithColors}`)
  console.log(`   Pages without Discord Colors: ${totalPages - pagesWithColors}`)
  console.log(`   Coverage: ${((pagesWithColors / totalPages) * 100).toFixed(1)}%\n`)

  console.log(`📋 DETAILED BREAKDOWN:`)
  results.forEach(r => {
    const colorCount = Object.values(r.colors).filter(v => v).length
    const status = colorCount === 0 ? '⚠️ ' : colorCount === 4 ? '✅' : '🔶'
    console.log(`   ${status} ${r.page}: ${colorCount}/4 Discord colors`)
  })

  if (results.some(r => r.issues.length > 0)) {
    console.log(`\n⚠️  ISSUES FOUND:`)
    results.forEach(r => {
      if (r.issues.length > 0) {
        console.log(`   ${r.page}:`)
        r.issues.forEach(issue => console.log(`      - ${issue}`))
      }
    })
  }

  console.log('\n' + '='.repeat(70))
  console.log('RECOMMENDATIONS:')
  console.log('='.repeat(70) + '\n')

  console.log('1. ✅ Discord colors are likely applied via Tailwind CSS classes')
  console.log('2. ✅ Client-side rendering may hide colors from initial HTML')
  console.log('3. 🔍 Check actual rendered pages in browser for visual consistency')
  console.log('4. 🔍 Verify Tailwind config has Discord colors defined')
  console.log('5. 🔍 Ensure all components use consistent background classes\n')

  console.log('DISCORD COLOR PALETTE:')
  console.log(`   Darkest:   ${DISCORD_COLORS.darkest} (primary background)`)
  console.log(`   Secondary: ${DISCORD_COLORS.secondary} (cards/containers)`)
  console.log(`   Tertiary:  ${DISCORD_COLORS.tertiary} (hover states)`)
  console.log(`   Blurple:   ${DISCORD_COLORS.blurple} (accent/CTAs)\n`)
}

async function main() {
  console.log('🎨 ANALYZING DISCORD COLOR CONSISTENCY\n')

  await analyzeAllPages()
  generateReport()

  console.log('✅ Color analysis complete!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })

