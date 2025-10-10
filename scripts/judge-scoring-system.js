// scripts/judge-scoring-system.js
// British Parliamentary Judge Scoring System for KDBI

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// BP Scoring Configuration
const BP_SCORING = {
  // Victory Points based on team ranking in room
  VICTORY_POINTS: {
    1: 3, // 1st place team gets 3 points
    2: 2, // 2nd place team gets 2 points  
    3: 1, // 3rd place team gets 1 point
    4: 0  // 4th place team gets 0 points
  },
  
  // Speaker score ranges (standard BP)
  SPEAKER_SCORES: {
    MIN: 60,
    MAX: 80,
    AVERAGE: 70
  },
  
  // BP Positions and roles
  POSITIONS: {
    'OG': { name: 'Opening Government', speakers: ['PM', 'DPM'] },
    'OO': { name: 'Opening Opposition', speakers: ['LO', 'DLO'] },
    'CG': { name: 'Closing Government', speakers: ['MG', 'GW'] },
    'CO': { name: 'Closing Opposition', speakers: ['MO', 'OW'] }
  }
}

/**
 * Submit judge scores for a debate match
 * @param {string} matchId - The debate match ID
 * @param {string} judgeId - The judge user ID
 * @param {Object} scores - Scores object with team rankings and speaker scores
 */
async function submitJudgeScores(matchId, judgeId, scores) {
  console.log(`📝 Judge ${judgeId} submitting scores for match ${matchId}`)
  
  try {
    // Get match details with teams and round info
    const match = await prisma.debateMatch.findUnique({
      where: { id: matchId },
      include: {
        team1: { include: { teamMembers: { include: { participant: true } } } },
        team2: { include: { teamMembers: { include: { participant: true } } } },
        team3: { include: { teamMembers: { include: { participant: true } } } },
        team4: { include: { teamMembers: { include: { participant: true } } } },
        round: true,
        scores: true
      }
    })

    if (!match) {
      throw new Error('Match not found')
    }

    const teams = [match.team1, match.team2, match.team3, match.team4]
    const isFinalStage = match.round.stage === 'FINAL'
    
    // Validate scores structure
    validateScores(scores, teams)
    
    // Check if this judge already submitted scores
    const existingScores = match.scores.filter(s => s.judgeId === judgeId)
    if (existingScores.length > 0) {
      throw new Error('Judge has already submitted scores for this match')
    }
    
    // Process each team's scores
    for (let teamIndex = 0; teamIndex < 4; teamIndex++) {
      const team = teams[teamIndex]
      const teamScore = scores.teams[teamIndex]
      const teamPosition = ['OG', 'OO', 'CG', 'CO'][teamIndex]
      
      if (!team || !teamScore) continue
      
      // Submit scores for each speaker in the team
      for (let speakerIndex = 0; speakerIndex < team.teamMembers.length; speakerIndex++) {
        const member = team.teamMembers[speakerIndex]
        const speakerScore = teamScore.speakers[speakerIndex]
        const bpPosition = BP_SCORING.POSITIONS[teamPosition].speakers[speakerIndex]
        
        await prisma.debateScore.create({
          data: {
            matchId: matchId,
            participantId: member.participantId,
            score: speakerScore,
            judgeId: judgeId,
            bpPosition: bpPosition,
            teamPosition: teamPosition,
            speakerRank: calculateSpeakerRank(speakerScore, scores)
          }
        })
      }
    }
    
    // For final stage (3 judges), check if all judges have submitted
    if (isFinalStage) {
      const allScores = await prisma.debateScore.findMany({
        where: { matchId: matchId }
      })
      
      const uniqueJudges = new Set(allScores.map(s => s.judgeId))
      
      if (uniqueJudges.size === 3) {
        // All 3 judges have submitted, calculate final results
        await calculateFinalResults(matchId, teams)
      } else {
        console.log(`📊 Final stage: ${uniqueJudges.size}/3 judges have submitted scores`)
      }
    } else {
      // Single judge - update match results immediately
      await updateMatchResults(matchId, teams, scores)
    }
    
    console.log('✅ Scores submitted successfully')
    
  } catch (error) {
    console.error('❌ Error submitting scores:', error)
    throw error
  }
}

/**
 * Validate judge scores input
 */
function validateScores(scores, teams) {
  // Check team rankings (must be 1,2,3,4)
  if (!scores.teamRankings || scores.teamRankings.length !== 4) {
    throw new Error('Team rankings must contain exactly 4 positions')
  }
  
  const sortedRankings = [...scores.teamRankings].sort()
  if (JSON.stringify(sortedRankings) !== JSON.stringify([1,2,3,4])) {
    throw new Error('Team rankings must be [1,2,3,4] in some order')
  }
  
  // Check speaker scores
  if (!scores.teams || scores.teams.length !== 4) {
    throw new Error('Must provide scores for exactly 4 teams')
  }
  
  scores.teams.forEach((team, index) => {
    if (!team.speakers || team.speakers.length !== 2) {
      throw new Error(`Team ${index + 1} must have exactly 2 speaker scores`)
    }
    
    team.speakers.forEach((score, speakerIndex) => {
      if (score < BP_SCORING.SPEAKER_SCORES.MIN || score > BP_SCORING.SPEAKER_SCORES.MAX) {
        throw new Error(`Speaker score must be between ${BP_SCORING.SPEAKER_SCORES.MIN}-${BP_SCORING.SPEAKER_SCORES.MAX}`)
      }
    })
  })
}

/**
 * Calculate speaker rank (1-8) based on score
 */
function calculateSpeakerRank(speakerScore, allScores) {
  const allSpeakerScores = []
  
  allScores.teams.forEach(team => {
    team.speakers.forEach(score => {
      allSpeakerScores.push(score)
    })
  })
  
  allSpeakerScores.sort((a, b) => b - a) // Descending order
  
  return allSpeakerScores.indexOf(speakerScore) + 1
}

/**
 * Calculate final results for matches with 3 judges (Final stage)
 */
async function calculateFinalResults(matchId, teams) {
  console.log('🏆 Calculating final results from 3 judges...')
  
  try {
    // Get all scores from 3 judges
    const allScores = await prisma.debateScore.findMany({
      where: { matchId: matchId },
      include: { participant: true }
    })
    
    // Group scores by team and calculate averages
    const teamResults = []
    
    for (let teamIndex = 0; teamIndex < 4; teamIndex++) {
      const team = teams[teamIndex]
      if (!team) continue
      
      const teamScores = allScores.filter(score => {
        const teamPosition = ['OG', 'OO', 'CG', 'CO'][teamIndex]
        return score.teamPosition === teamPosition
      })
      
      // Calculate average speaker scores
      const speakerAverages = []
      const speakers = team.teamMembers.slice(0, 2)
      
      for (let speakerIndex = 0; speakerIndex < speakers.length; speakerIndex++) {
        const member = speakers[speakerIndex]
        const speakerScores = teamScores.filter(s => s.participantId === member.participantId)
        const avgScore = speakerScores.reduce((sum, s) => sum + s.score, 0) / speakerScores.length
        speakerAverages.push(avgScore)
      }
      
      teamResults.push({
        teamIndex,
        team,
        averageScore: speakerAverages.reduce((sum, score) => sum + score, 0),
        speakerAverages
      })
    }
    
    // Sort teams by average score (highest first)
    teamResults.sort((a, b) => b.averageScore - a.averageScore)
    
    // Create final rankings
    const finalRankings = [0, 0, 0, 0]
    teamResults.forEach((result, rank) => {
      finalRankings[result.teamIndex] = rank + 1
    })
    
    // Update match with final results
    await updateMatchResults(matchId, teams, {
      teamRankings: finalRankings,
      teams: teamResults.map(r => ({ speakers: r.speakerAverages }))
    })
    
    console.log('✅ Final results calculated from 3 judges')
    
  } catch (error) {
    console.error('❌ Error calculating final results:', error)
    throw error
  }
}

/**
 * Update match results (single judge or final averaged results)
 */
async function updateMatchResults(matchId, teams, scores) {
  // Update match with team rankings
  await prisma.debateMatch.update({
    where: { id: matchId },
    data: {
      firstPlaceTeamId: teams[scores.teamRankings[0] - 1]?.id,
      secondPlaceTeamId: teams[scores.teamRankings[1] - 1]?.id,
      thirdPlaceTeamId: teams[scores.teamRankings[2] - 1]?.id,
      fourthPlaceTeamId: teams[scores.teamRankings[3] - 1]?.id,
      completedAt: new Date()
    }
  })
  
  // Update team standings
  await updateTeamStandings(teams, scores)
}

/**
 * Update team standings with new results
 */
async function updateTeamStandings(teams, scores) {
  for (let i = 0; i < 4; i++) {
    const team = teams[i]
    if (!team) continue
    
    const teamRank = scores.teamRankings.indexOf(i + 1) + 1
    const victoryPoints = BP_SCORING.VICTORY_POINTS[teamRank]
    
    // Calculate total speaker points for this team
    const teamSpeakerPoints = scores.teams[i].speakers.reduce((sum, score) => sum + score, 0)
    
    // Update or create team standing
    const existingStanding = await prisma.teamStanding.findUnique({
      where: { registrationId: team.id }
    })
    
    if (existingStanding) {
      const newMatchesPlayed = existingStanding.matchesPlayed + 1
      const newTotalSpeakerPoints = existingStanding.speakerPoints + teamSpeakerPoints
      
      await prisma.teamStanding.update({
        where: { registrationId: team.id },
        data: {
          teamPoints: existingStanding.teamPoints + victoryPoints,
          speakerPoints: newTotalSpeakerPoints,
          averageSpeakerPoints: newTotalSpeakerPoints / newMatchesPlayed,
          matchesPlayed: newMatchesPlayed,
          firstPlaces: existingStanding.firstPlaces + (teamRank === 1 ? 1 : 0),
          secondPlaces: existingStanding.secondPlaces + (teamRank === 2 ? 1 : 0),
          thirdPlaces: existingStanding.thirdPlaces + (teamRank === 3 ? 1 : 0),
          fourthPlaces: existingStanding.fourthPlaces + (teamRank === 4 ? 1 : 0),
          avgPosition: calculateAveragePosition(existingStanding, teamRank)
        }
      })
    }
  }
}

/**
 * Calculate average position for team
 */
function calculateAveragePosition(standing, newRank) {
  const totalPositions = (standing.firstPlaces * 1) + 
                        (standing.secondPlaces * 2) + 
                        (standing.thirdPlaces * 3) + 
                        (standing.fourthPlaces * 4) + 
                        newRank
  
  return totalPositions / (standing.matchesPlayed + 1)
}

/**
 * Get match results for display
 */
async function getMatchResults(matchId) {
  const match = await prisma.debateMatch.findUnique({
    where: { id: matchId },
    include: {
      team1: { include: { teamMembers: { include: { participant: true } } } },
      team2: { include: { teamMembers: { include: { participant: true } } } },
      team3: { include: { teamMembers: { include: { participant: true } } } },
      team4: { include: { teamMembers: { include: { participant: true } } } },
      scores: { include: { participant: true } },
      round: true
    }
  })
  
  return match
}

/**
 * Generate tournament standings
 */
async function getTournamentStandings(stage = null) {
  const whereClause = stage ? 
    { registration: { competition: { type: 'KDBI' } } } :
    { registration: { competition: { type: 'KDBI' } } }
  
  const standings = await prisma.teamStanding.findMany({
    where: whereClause,
    include: {
      registration: {
        include: {
          participant: true,
          teamMembers: { include: { participant: true } }
        }
      }
    },
    orderBy: [
      { teamPoints: 'desc' },
      { averageSpeakerPoints: 'desc' },
      { avgPosition: 'asc' }
    ]
  })
  
  return standings
}

// Example usage and testing
async function exampleJudgeScoring() {
  console.log('📋 Example: Judge Scoring a BP Match')
  console.log('=' .repeat(40))
  
  // Example scores structure
  const exampleScores = {
    // Team rankings: 1st, 2nd, 3rd, 4th place
    teamRankings: [2, 1, 4, 3], // Team 2 wins, Team 1 second, Team 4 third, Team 3 fourth
    
    // Speaker scores for each team (2 speakers per team)
    teams: [
      { speakers: [72, 71] }, // Team 1 (OG): PM=72, DPM=71
      { speakers: [75, 74] }, // Team 2 (OO): LO=75, DLO=74  
      { speakers: [68, 67] }, // Team 3 (CG): MG=68, GW=67
      { speakers: [70, 69] }  // Team 4 (CO): MO=70, OW=69
    ]
  }
  
  console.log('Team Rankings:', exampleScores.teamRankings)
  console.log('Victory Points Distribution:')
  exampleScores.teamRankings.forEach((teamNum, rank) => {
    console.log(`  Team ${teamNum}: Rank ${rank + 1} = ${BP_SCORING.VICTORY_POINTS[rank + 1]} points`)
  })
  
  console.log('\nSpeaker Scores:')
  exampleScores.teams.forEach((team, index) => {
    const position = ['OG', 'OO', 'CG', 'CO'][index]
    const speakers = BP_SCORING.POSITIONS[position].speakers
    console.log(`  ${position}: ${speakers[0]}=${team.speakers[0]}, ${speakers[1]}=${team.speakers[1]}`)
  })
}

if (require.main === module) {
  exampleJudgeScoring().catch(console.error)
}

module.exports = {
  submitJudgeScores,
  getMatchResults,
  getTournamentStandings,
  calculateFinalResults,
  updateMatchResults,
  BP_SCORING,
  validateScores
}
