# Reset Scripts Documentation

## Reset Debate Matches & Scores

Script: `reset-debate-matches-scores.js`

### Usage

#### 1. Reset ALL Debate Data (KDBI + EDC)

```bash
# Dry run (preview only)
node scripts/reset-debate-matches-scores.js

# Actually delete
node scripts/reset-debate-matches-scores.js --confirm
```

**Deletes:**
- ❌ All debate scores
- ❌ All debate matches
- ❌ All team standings

**Keeps:**
- ✅ Debate rounds (can be reused)
- ✅ Registrations
- ✅ Participants
- ✅ Competitions

#### 2. Reset Specific Competition (KDBI or EDC only)

```bash
# Reset KDBI only (dry run)
node scripts/reset-debate-matches-scores.js --competition=KDBI

# Reset KDBI only (confirmed)
node scripts/reset-debate-matches-scores.js --competition=KDBI --confirm

# Reset EDC only (confirmed)
node scripts/reset-debate-matches-scores.js --competition=EDC --confirm
```

### Safety Features

1. **Dry Run by Default**: Always previews what will be deleted
2. **Requires --confirm**: Won't delete without explicit confirmation
3. **Shows Counts**: Displays number of items before deletion
4. **Ordered Deletion**: Deletes child records first (scores → standings → matches)

### Example Output

```
🗑️  RESET DEBATE MATCHES & SCORES
==================================================

📊 Current Data:
  - Debate Matches: 48
  - Debate Scores: 384
  - Team Standings: 32

⚠️  DRY RUN MODE
This script will delete:
  ❌ 384 debate scores
  ❌ 48 debate matches
  ❌ 32 team standings

To actually delete, run with: --confirm
```

### When to Use

- Testing new tournament generation
- Fixing corrupted match data
- Starting fresh for a new round
- Clearing duplicate or invalid scores

### Warning

⚠️ **DESTRUCTIVE OPERATION** - Cannot be undone!

Always:
1. Run dry run first
2. Backup database before confirming
3. Use `--competition=` to target specific competition if possible
