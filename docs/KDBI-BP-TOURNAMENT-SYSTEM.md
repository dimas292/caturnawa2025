# KDBI British Parliamentary Tournament System

## 🏆 Tournament Structure

### Competition Format: British Parliamentary (BP)
- **4 teams per room** (breakout room)
- **2 speakers per team**
- **3 tournament stages** with different round counts

### Tournament Stages

#### 1. Preliminary Stage
- **4 rounds** (Round 1, 2, 3, 4)
- **3 breakout rooms per round**
- **12 teams maximum per round** (3 rooms × 4 teams)

#### 2. Semifinal Stage  
- **2 rounds** (Round 1, 2)
- **2 breakout rooms per round**
- **8 teams total** (top teams from preliminaries)

#### 3. Final Stage
- **3 rounds** (Round 1, 2, 3)
- **4 breakout rooms per round** 
- **16 teams maximum per round**

## 🎯 British Parliamentary Positions

### Room Setup (4 teams per room):
1. **Opening Government (OG)**
   - Prime Minister (PM)
   - Deputy Prime Minister (DPM)

2. **Opening Opposition (OO)**
   - Leader of Opposition (LO)
   - Deputy Leader of Opposition (DLO)

3. **Closing Government (CG)**
   - Member of Government (MG)
   - Government Whip (GW)

4. **Closing Opposition (CO)**
   - Member of Opposition (MO)
   - Opposition Whip (OW)

## 📊 Victory Points System

### Team Rankings & Points:
- **1st Place**: 3 Victory Points
- **2nd Place**: 2 Victory Points  
- **3rd Place**: 1 Victory Point
- **4th Place**: 0 Victory Points

### Speaker Scoring:
- **Range**: 60-80 points
- **Average**: 70 points
- **Individual speaker rankings**: 1-8 within each room

## 👨‍⚖️ Judge Scoring Mechanism

### Judge Assignment:
- **Preliminary & Semifinal**: **1 judge per room**
- **Final Stage**: **3 judges per room** (judge panel)

### Judge Responsibilities:
1. **Rank teams 1-4** in each room based on overall performance
2. **Score individual speakers** (60-80 points each)
3. **Submit scores** through digital scoring form

### Scoring Criteria:
- **Argument Quality**: Logic, evidence, analysis
- **Refutation**: Addressing opposing arguments
- **Style**: Delivery, clarity, persuasiveness  
- **Strategy**: Team coordination, case building

### Scoring Process:

#### Single Judge (Preliminary & Semifinal):
1. Judge watches the debate round
2. Takes notes on each speaker's performance
3. Ranks teams from 1st to 4th place
4. Assigns individual speaker scores (60-80)
5. Submits scores via BP Scoring Form
6. Results calculated immediately

#### Judge Panel (Final Stage):
1. **3 judges** independently score the same match
2. Each judge submits individual rankings and scores
3. **Final results calculated** when all 3 judges submit
4. **Average speaker scores** used for final rankings
5. **Consensus ranking** based on combined scores

## 🏅 Tournament Progression

### Preliminary Stage (4 rounds):
- All registered teams participate
- Teams accumulate victory points across 4 rounds
- Speaker points used for tie-breaking

### Semifinal Stage (2 rounds):
- **Top 8 teams** from preliminaries advance
- **2 rooms per round** (8 teams total)
- Additional 2 rounds of competition
- Cumulative scoring continues

### Final Stage (3 rounds):
- Top teams from semifinals advance
- Final 3 rounds determine champions
- Highest total victory points wins

## 📈 Standings Calculation

### Team Standings (Primary):
1. **Total Victory Points** (sum across all rounds)
2. **Average Speaker Points** (tie-breaker)
3. **Average Position** (secondary tie-breaker)

### Individual Speaker Rankings:
1. **Total Speaker Points** across all rounds
2. **Average Speaker Points** per round
3. **Speaker rank consistency**

## 🔧 Technical Implementation

### Database Structure:
- **DebateRound**: Stores each round (stage, round number)
- **DebateMatch**: Individual rooms/matches within rounds
- **DebateScore**: Individual speaker scores and rankings
- **TeamStanding**: Cumulative team statistics

### Judge Interface:
- **BP Scoring Form**: Digital form for score submission
- **Real-time validation**: Ensures proper rankings and scores
- **Match overview**: Shows team positions and speaker names

### Tournament Management:
- **Automatic team assignment** to rooms
- **Real-time standings** calculation
- **Progressive tournament** advancement
- **Comprehensive reporting** system

## 📋 Example Scoring Scenario

### Room 1 Results:
- **Team A (OG)**: 2nd place → 2 victory points
- **Team B (OO)**: 1st place → 3 victory points  
- **Team C (CG)**: 4th place → 0 victory points
- **Team D (CO)**: 3rd place → 1 victory point

### Speaker Scores:
- **Team A**: PM=72, DPM=71 (Total: 143)
- **Team B**: LO=75, DLO=74 (Total: 149)
- **Team C**: MG=68, GW=67 (Total: 135)  
- **Team D**: MO=70, OW=69 (Total: 139)

### Speaker Rankings (1-8):
1. LO (Team B): 75 points
2. DLO (Team B): 74 points
3. PM (Team A): 72 points
4. DPM (Team A): 71 points
5. MO (Team D): 70 points
6. OW (Team D): 69 points
7. MG (Team C): 68 points
8. GW (Team C): 67 points

## 🎮 Usage Instructions

### For Tournament Directors:
```bash
# Create tournament structure
node scripts/create-kdbi-tournament.js

# Assign teams to preliminary matches  
node scripts/assign-teams.js
```

### For Judges:
1. Access judge dashboard
2. Select assigned match/room
3. Use BP Scoring Form to submit scores
4. Validate all rankings and scores before submission

### For Participants:
- View real-time standings
- Check match assignments
- Track individual and team progress

This British Parliamentary system ensures fair, competitive, and comprehensive tournament management for KDBI with proper scoring mechanisms and clear progression paths.
