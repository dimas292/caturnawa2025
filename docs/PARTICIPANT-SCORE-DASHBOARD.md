# Participant Score Dashboard

## 🎯 Overview

Dashboard untuk peserta melihat nilai dan hasil pertandingan mereka sendiri dalam tournament British Parliamentary, memberikan transparansi dan feedback yang dibutuhkan untuk perkembangan debater.

---

## 📊 Score Visibility System

### What Participants Can See:

#### ✅ **Own Team Results**:
- Individual speaker scores (PM, DPM, etc.)
- Team ranking in each match (1st, 2nd, 3rd, 4th)
- Victory points earned per match
- Judge feedback comments (if provided)

#### ✅ **Own Performance Analytics**:
- Average speaker score across rounds
- Best/worst performance rounds
- Progress tracking over tournament
- Position-specific performance (OG, OO, CG, CO)

#### ❌ **Cannot See**:
- Other teams' detailed scores
- Other participants' individual scores
- Judge identities (for fairness)
- Scores from frozen rounds (until unfrozen)

---

## 🏠 Dashboard Layout

### Main Dashboard View:
```
🏆 Team Alpha - KDBI Tournament Dashboard

📈 Overall Performance
┌─────────────────────────────────────────┐
│ Team Ranking: #3 (as of Round 3)       │
│ Total Victory Points: 6                 │
│ Average Speaker Score: 71.2             │
│ Matches Played: 3/4                     │
└─────────────────────────────────────────┘

🎯 Individual Performance
┌─────────────────────────────────────────┐
│ Your Role: Prime Minister (PM)          │
│ Your Average: 72.5                      │
│ Best Score: 75 (Round 1)               │
│ Tournament Rank: #8 (among all PMs)    │
└─────────────────────────────────────────┘
```

### Match History Section:
```
📋 Match Results

🏠 Round 1 - Room 2 (Completed)
┌─────────────────────────────────────────┐
│ Position: Opening Government (OG)       │
│ Team Result: 2nd Place (2 VP)          │
│                                         │
│ Speaker Scores:                         │
│ • You (PM): 75 points                  │
│ • Partner (DPM): 73 points             │
│ Team Total: 148 points                  │
│                                         │
│ Judge Comments:                         │
│ "Strong opening case with clear        │
│  structure. Good rebuttals."           │
└─────────────────────────────────────────┘

🏠 Round 2 - Room 1 (🧊 Frozen)
┌─────────────────────────────────────────┐
│ Position: Opening Opposition (OO)       │
│ Status: Results temporarily hidden      │
│ Will be revealed after Round 4          │
└─────────────────────────────────────────┘

🏠 Round 3 - Room 3 (Completed)
┌─────────────────────────────────────────┐
│ Position: Closing Government (CG)       │
│ Team Result: 1st Place (3 VP)          │
│                                         │
│ Speaker Scores:                         │
│ • You (MG): 74 points                  │
│ • Partner (GW): 72 points              │
│ Team Total: 146 points                  │
│                                         │
│ Judge Comments:                         │
│ "Excellent extension. Clear POI        │
│  handling and strong summary."         │
└─────────────────────────────────────────┘
```

---

## 📈 Performance Analytics

### Individual Speaker Analytics:
```
📊 Your Speaker Performance

Score Progression:
Round 1: 75 ██████████████████████ (PM)
Round 3: 74 █████████████████████  (MG)
Round 4: -- ████████████████████   (Pending)

Average by Position:
• Prime Minister (PM): 75.0
• Deputy PM (DPM): --
• Member of Govt (MG): 74.0
• Govt Whip (GW): --
• Leader of Opp (LO): --
• Deputy LO (DLO): --
• Member of Opp (MO): --
• Opp Whip (OW): --

📈 Trend: Consistent high performance
🎯 Next Goal: Maintain 74+ average
```

### Team Performance Analytics:
```
🏆 Team Performance Dashboard

Victory Points Progress:
Round 1: 2 VP (2nd place)
Round 2: ? VP (Frozen)
Round 3: 3 VP (1st place)
Total: 5 VP (excluding frozen)

Position Performance:
• Opening Gov (OG): 2 VP (1 match)
• Opening Opp (OO): ? VP (frozen)
• Closing Gov (CG): 3 VP (1 match)
• Closing Opp (CO): -- (not played)

Team Chemistry Score: 72.5 avg
(Average of both speakers combined)
```

---

## 🔒 Privacy & Access Control

### Data Access Rules:

#### Participant Login Required:
- Must be logged in as participant
- Can only access own team's data
- Cannot view other teams' detailed scores

#### Score Visibility Timeline:
```javascript
const scoreVisibility = {
  immediate: [
    "own_speaker_scores",
    "own_team_ranking", 
    "victory_points_earned",
    "judge_comments"
  ],
  after_unfreeze: [
    "frozen_round_scores",
    "updated_standings"
  ],
  never: [
    "other_teams_scores",
    "judge_identities",
    "admin_notes"
  ]
}
```

#### Team Member Access:
- Both team members can see full team data
- Individual scores visible to respective speakers
- Team leader has no additional privileges

---

## 🛠 Technical Implementation

### Database Queries:
```javascript
// Get participant's own scores
async function getParticipantScores(participantId) {
  return await prisma.debateScore.findMany({
    where: { 
      participantId: participantId,
      match: {
        round: {
          isFrozen: false // Exclude frozen rounds
        }
      }
    },
    include: {
      match: {
        include: {
          round: true,
          // Only include team info for own team
          team1: { where: { participantId } },
          team2: { where: { participantId } },
          team3: { where: { participantId } },
          team4: { where: { participantId } }
        }
      }
    }
  })
}
```

### API Endpoints:
```javascript
// GET /api/participant/dashboard
// GET /api/participant/scores
// GET /api/participant/matches
// GET /api/participant/analytics
// GET /api/participant/team-performance
```

### Component Structure:
```jsx
<ParticipantDashboard>
  <OverallPerformance />
  <IndividualStats />
  
  <MatchHistory>
    {matches.map(match => (
      <MatchCard 
        key={match.id}
        match={match}
        showFrozenState={match.round.isFrozen}
      />
    ))}
  </MatchHistory>
  
  <PerformanceAnalytics>
    <SpeakerProgression />
    <PositionAnalysis />
    <TeamChemistry />
  </PerformanceAnalytics>
</ParticipantDashboard>
```

---

## 🎨 UI/UX Features

### Interactive Elements:

#### Score Cards:
- **Hover Effects**: Show detailed breakdown
- **Color Coding**: Green (good), Yellow (average), Red (needs improvement)
- **Progress Bars**: Visual representation of scores
- **Trend Icons**: ↗️ improving, ↘️ declining, ➡️ stable

#### Frozen Round Indicators:
- **Ice Icon** 🧊 for frozen rounds
- **Countdown Timer** until unfreeze
- **Placeholder Message** explaining freeze status

#### Performance Badges:
- 🥇 **"Top Speaker"** (75+ average)
- 🎯 **"Consistent"** (low score variance)
- 📈 **"Improving"** (upward trend)
- 🤝 **"Team Player"** (good team chemistry)

### Mobile Responsive:
```css
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .match-card {
    padding: 12px;
    font-size: 14px;
  }
  
  .score-display {
    flex-direction: column;
  }
}
```

---

## 📱 Dashboard Sections

### 1. Quick Stats Header:
```
Team Alpha | Round 3/4 | Rank #3 | 6 VP | 71.2 avg
```

### 2. Current Tournament Status:
- Next match information
- Tournament stage progression
- Upcoming schedule

### 3. Match Results Feed:
- Chronological list of completed matches
- Real-time updates when new scores available
- Frozen round placeholders

### 4. Performance Insights:
- Strength/weakness analysis
- Improvement suggestions
- Comparison with previous tournaments

### 5. Team Coordination:
- Partner performance overview
- Team strategy notes (private)
- Communication tools

---

## 🔔 Notifications & Updates

### Real-time Notifications:
```javascript
const notifications = [
  {
    type: "score_available",
    message: "Your Round 3 scores are now available!",
    action: "View Results"
  },
  {
    type: "round_unfrozen", 
    message: "Round 2 results have been revealed!",
    action: "See Updated Standings"
  },
  {
    type: "next_match",
    message: "Round 4 starts in 30 minutes - Room 2",
    action: "View Details"
  }
]
```

### Email Summaries:
- End-of-round performance summary
- Daily tournament progress report
- Final tournament results

---

## 🎯 Benefits

### For Participants:
- **Immediate Feedback**: See performance right after each round
- **Progress Tracking**: Monitor improvement throughout tournament
- **Transparency**: Clear understanding of scoring
- **Motivation**: Visual progress and achievement badges

### For Tournament Management:
- **Reduced Queries**: Participants self-serve score information
- **Professional Image**: Modern, transparent tournament system
- **Data Analytics**: Track participant engagement
- **Conflict Reduction**: Clear, accessible scoring reduces disputes

### For Educational Value:
- **Learning Tool**: Understand judging criteria through detailed feedback
- **Skill Development**: Identify areas for improvement
- **Team Dynamics**: Analyze team chemistry and positioning strategy
- **Career Tracking**: Long-term performance history across tournaments

---

## 🚀 Future Enhancements

### Advanced Analytics:
- **AI-powered insights** on speaking patterns
- **Comparative analysis** with similar skill level debaters
- **Prediction models** for optimal position assignments
- **Video review integration** with timestamped scores

### Social Features:
- **Achievement sharing** on social media
- **Team collaboration tools** for strategy planning
- **Peer feedback system** for practice rounds
- **Mentorship matching** based on performance data

### Integration Options:
- **Calendar sync** for match schedules
- **Mobile app** for on-the-go access
- **Export tools** for portfolio building
- **API access** for third-party analysis tools

This participant dashboard system creates a comprehensive, user-friendly interface that enhances the tournament experience while maintaining appropriate privacy and competitive integrity.