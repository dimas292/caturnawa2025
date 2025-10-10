# Frozen Rounds & Judge Display System

## 🧊 Frozen Rounds Mechanism

### Purpose
- **Create suspense** in tournament standings
- **Prevent tactical gaming** based on current rankings
- **Maintain competitive integrity** throughout preliminary rounds
- **Add excitement** to final standings reveal

### Frozen Rounds Configuration

#### Preliminary Stage (4 rounds):
- **Round 1**: ✅ Visible (teams need early feedback)
- **Round 2**: ❄️ **FROZEN** (hidden from leaderboard)
- **Round 3**: ✅ Visible (mid-tournament checkpoint)
- **Round 4**: ❄️ **FROZEN** (final round suspense)

#### Semifinal Stage (2 rounds):
- **Round 1**: ✅ Visible (progression transparency)
- **Round 2**: ✅ Visible (final semifinal results needed)

#### Final Stage (3 rounds):
- **Round 1**: ✅ Visible
- **Round 2**: ❄️ **FROZEN** (optional - tournament director choice)
- **Round 3**: ✅ Visible (champion announcement)

### Technical Implementation

#### Database Schema Enhancement:
```sql
-- Add to DebateRound model
model DebateRound {
  // ... existing fields
  isFrozen      Boolean   @default(false)
  frozenUntil   DateTime? // Auto-unfreeze timestamp
  frozenBy      String?   // Admin who froze the round
}

-- Add to Competition model  
model Competition {
  // ... existing fields
  frozenRounds  Json?     // Array of round numbers to freeze: [2,4]
  autoFreeze    Boolean   @default(true)
}
```

#### Configuration Constants:
```javascript
const FROZEN_ROUNDS_CONFIG = {
  PRELIMINARY: [2, 4],    // Rounds 2 & 4 frozen
  SEMIFINAL: [],          // No frozen rounds
  FINAL: [2]              // Round 2 frozen (optional)
}

const FREEZE_DURATION = {
  PRELIMINARY: 30,        // 30 minutes after round completion
  SEMIFINAL: 15,          // 15 minutes
  FINAL: 60              // 1 hour for dramatic effect
}
```

### Freeze Behavior

#### Automatic Freezing:
1. **Round Completion Detection**: When all matches in a "frozen round" are scored
2. **Auto-Freeze Trigger**: System automatically hides round results
3. **Timer-Based Unfreeze**: Results visible after configured duration
4. **Manual Override**: Tournament director can unfreeze early

#### What Gets Frozen:
- ✅ **Individual Speaker Scores**: Still visible to judges/admin
- ❄️ **Team Rankings**: Hidden from public leaderboard
- ❄️ **Victory Points**: Not counted in standings calculation
- ❄️ **Position Changes**: Leaderboard shows "previous round" standings
- ✅ **Match Results**: Teams know their own room results

#### Leaderboard Display During Freeze:
```
🏆 KDBI Leaderboard (After Round 3)
⚠️ Round 2 & 4 results are frozen

Rank | Team Name        | VP* | SP*  | Avg
-----|------------------|-----|------|----
 1   | Team Alpha       | 6   | 284  | 71.0
 2   | Team Beta        | 4   | 278  | 69.5
 3   | Team Gamma       | 3   | 275  | 68.8

* Excluding frozen rounds
🧊 Full results will be revealed after Round 4
```

---

## 👨‍⚖️ Judge Display System

### Purpose
- **Transparency** in judge assignments
- **Easy coordination** for tournament staff
- **Clear communication** to participants
- **Professional presentation** of judging panel

### Judge Assignment Display

#### Room Overview Format:
```
🏠 ROOM 1 - Preliminary Round 2
👨‍⚖️ Judge: Prof. Dr. Ahmad Wijaya

🏠 ROOM 2 - Semifinal Round 1  
👨‍⚖️ Judge: Dr. Siti Nurhaliza

🏠 ROOM 3 - Final Round 1
👨‍⚖️ Chief Judge: Prof. Budi Santoso
👨‍⚖️ Panelist 1: Dr. Maya Sari
👨‍⚖️ Panelist 2: Prof. Dr. Indra Gunawan
```

#### Database Schema Enhancement:
```sql
model JudgeAssignment {
  id          String      @id @default(cuid())
  matchId     String
  judgeId     String
  match       DebateMatch @relation(fields: [matchId], references: [id])
  judge       User        @relation(fields: [judgeId], references: [id])
  
  role        String      // "Judge", "Chief Judge", "Panelist 1", "Panelist 2"
  assignedAt  DateTime    @default(now())
  assignedBy  String?     // Admin who made assignment
  
  // Judge availability tracking
  isConfirmed Boolean     @default(false)
  confirmedAt DateTime?
  notes       String?     // Special instructions
  
  @@unique([matchId, judgeId])
}
```

### Judge Panel Configuration

#### Preliminary & Semifinal (1 Judge):
```javascript
const judgeConfig = {
  PRELIMINARY: {
    count: 1,
    roles: ["Judge"],
    displayFormat: "👨‍⚖️ Judge: {name}"
  },
  SEMIFINAL: {
    count: 1,
    roles: ["Judge"], 
    displayFormat: "👨‍⚖️ Judge: {name}"
  }
}
```

#### Final Stage (3 Judges Panel):
```javascript
const judgeConfig = {
  FINAL: {
    count: 3,
    roles: ["Chief Judge", "Panelist 1", "Panelist 2"],
    displayFormat: [
      "👨‍⚖️ Chief Judge: {name}",
      "👨‍⚖️ Panelist 1: {name}", 
      "👨‍⚖️ Panelist 2: {name}"
    ]
  }
}
```

### UI/UX Display Components

#### Room Card Component:
```jsx
<RoomCard>
  <RoomHeader>
    <RoomNumber>Room {roomNumber}</RoomNumber>
    <RoundInfo>{stage} Round {roundNumber}</RoundInfo>
  </RoomHeader>
  
  <JudgePanel>
    {judges.map(judge => (
      <JudgeInfo key={judge.id}>
        <JudgeRole>{judge.role}</JudgeRole>
        <JudgeName>{judge.name}</JudgeName>
        <JudgeStatus confirmed={judge.isConfirmed} />
      </JudgeInfo>
    ))}
  </JudgePanel>
  
  <TeamsSection>
    {/* Team assignments */}
  </TeamsSection>
</RoomCard>
```

#### Judge Status Indicators:
- ✅ **Confirmed**: Judge has confirmed availability
- ⏳ **Pending**: Waiting for judge confirmation
- ❌ **Unavailable**: Judge marked as unavailable
- 🔄 **Replaced**: Judge has been substituted

---

## 🔧 Technical Implementation

### API Endpoints

#### Frozen Rounds Management:
```javascript
// GET /api/admin/frozen-rounds?competition=KDBI&stage=PRELIMINARY
// POST /api/admin/frozen-rounds/freeze
// POST /api/admin/frozen-rounds/unfreeze
// GET /api/leaderboard?includeFrozen=false
```

#### Judge Assignment:
```javascript
// GET /api/admin/judge-assignments?stage=PRELIMINARY&round=1
// POST /api/admin/judge-assignments/assign
// PUT /api/admin/judge-assignments/{id}/confirm
// GET /api/judge/rooms?judgeId={id}
```

### Standings Calculation Logic:
```javascript
function calculateStandings(includeFrozenRounds = false) {
  const roundFilter = includeFrozenRounds 
    ? {}  // Include all rounds
    : { isFrozen: false }  // Exclude frozen rounds
    
  // Calculate team points only from visible rounds
  // Update display with frozen round disclaimer
}
```

### Automatic Freeze System:
```javascript
async function checkAndFreezeRounds() {
  const completedRounds = await getCompletedRounds()
  
  for (const round of completedRounds) {
    if (shouldBeFrozen(round) && !round.isFrozen) {
      await freezeRound(round.id)
      scheduleUnfreeze(round.id, FREEZE_DURATION[round.stage])
    }
  }
}
```

---

## 📋 Tournament Director Controls

### Freeze Management Dashboard:
- **Round Status Overview**: See which rounds are frozen/visible
- **Manual Freeze/Unfreeze**: Override automatic system
- **Freeze Duration Settings**: Customize timing per stage
- **Emergency Unfreeze**: Instant reveal for technical issues

### Judge Assignment Tools:
- **Drag & Drop Assignment**: Visual judge assignment interface
- **Conflict Detection**: Warn about judge-team conflicts
- **Availability Tracking**: Judge confirmation status
- **Substitution System**: Easy judge replacement workflow

### Real-time Notifications:
- **Judge Confirmations**: Alert when judges confirm/decline
- **Auto-freeze Triggers**: Notify when rounds get frozen
- **Scoring Completion**: Alert when all rooms finished
- **System Events**: Log all freeze/unfreeze actions

---

## 🎯 Benefits

### For Tournament Experience:
- **Increased Suspense**: Teams can't predict final standings
- **Fair Competition**: Prevents strategic behavior based on rankings
- **Professional Presentation**: Clear judge assignments build confidence
- **Smooth Operations**: Automated systems reduce admin workload

### For Technical Operations:
- **Flexible Configuration**: Easy to customize per tournament
- **Audit Trail**: Complete logging of all freeze/judge actions
- **Scalable System**: Works for tournaments of any size
- **Integration Ready**: Compatible with existing BP tournament system

This system enhances the tournament experience while maintaining the integrity and professionalism expected in British Parliamentary debate competitions.