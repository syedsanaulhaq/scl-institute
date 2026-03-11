# Moodle-Only Cohort Implementation

## Overview
Student cohort management is now handled entirely by Moodle. The SCL database no longer maintains redundant cohort tables. Moodle is the single source of truth for cohort membership and student grouping.

## Implementation Details

### Flow
1. **Student Acceptance** → POST `/applications/:id/review-decision` with status `accepted` or `conditional_accept`
2. **User Creation** → SCL creates user account in users table
3. **Cohort Assignment** → `assignStudentToMoodleCohort()` called with:
   - Student email
   - First name / Last name
   - Programme code (e.g., "DEG-001")
   - Intake start date

### Cohort Naming
Cohort name is derived from **intake date** (not application date):
- Intake in Aug 2026 or later → `DEG-001-2026-2027`
- Intake in Jul 2026 or earlier → `DEG-001-2025-2026`
- Formula: If month >= 8, year = that year; else year = previous year

**Moodle Cohort Structure**:
```
idnumber: DEG-001-2025-2026
name: DEG-001 Cohort 2025/2026
context: System (id=1)
mdl_cohort_members: Contains all students in that intake
```

### Implementation Files
- **Function**: `assignStudentToMoodleCohort()` in `backend/routes/students.js` (line ~2747)
- **Called from**: POST `/applications/:id/review-decision` (line ~2041)
- **Dependencies**:
  - `getMoodleUserIdByEmail()` - gets Moodle user ID from email
  - `moodleDbPool` - direct connection to Moodle database
  - Moodle REST API (via axios) with MOODLE_TOKEN
  - Fallback to direct mdl_cohort queries if REST fails

### Fallback Mechanisms
1. **REST API** → Create cohort and add member via Moodle web services
2. **If REST fails** → Query/insert directly in mdl_cohort tables
3. **If cohort exists** → Reuse existing cohort (idnumber is unique)

## Testing

### Manual Test
1. Accept a student with course code `DEG-001` and intake date in August 2026
2. Check Moodle database:
   ```sql
   -- Verify cohort created
   SELECT id, idnumber, name FROM mdl_cohort WHERE idnumber = 'DEG-001-2026-2027';
   
   -- Verify student added
   SELECT m.userid, m.cohortid, c.idnumber 
   FROM mdl_cohort_members m
   JOIN mdl_cohort c ON c.id = m.cohortid
   WHERE c.idnumber = 'DEG-001-2026-2027';
   ```

3. Check backend logs for:
   ```
   [MOODLE COHORT] Created cohort DEG-001-2026-2027
   [MOODLE COHORT] Added student@example.com to cohort DEG-001-2026-2027
   ```

### Automated Test
```bash
# Test cohort assignment directly
curl -X POST http://localhost:3000/applications/1/review-decision \
  -H "Content-Type: application/json" \
  -d '{ "decision": "accepted", "notes": "Test" }'

# Response should include cohort assignment logs in console
```

## Querying Student Cohorts (Usage in Code)

To get a student's cohort:
```javascript
// Query Moodle directly
const [cohortRows] = await moodleDbPool.execute(`
  SELECT c.id, c.idnumber, c.name
  FROM mdl_cohort_members m
  JOIN mdl_cohort c ON c.id = m.cohortid
  JOIN mdl_user u ON u.id = m.userid
  WHERE u.email = ?
  LIMIT 1
`, [studentEmail]);
```

To get current year of study:
```javascript
// Extract from cohort idnumber (e.g., "DEG-001-2025-2026")
// Year 1: 2025-2026, Year 2: 2026-2027, etc.
const [today] = new Date().getFullYear();
const cohortYear = parseInt(cohortIdnumber.split('-')[2]);
const currentYear = today - cohortYear + 1;
```

## Year Progression

Year 2 course access is controlled independently via `enforceProgrammeProgressionLocks()`:
- Sets `mdl_user_enrolments.status = 1` (suspended) for Year 2+ courses
- Only unlocked when Year 1 courses are completed
- Status is checked in `mdl_course_completions.timecompleted > 0`

Cohort membership stays the same; progression lock/unlock changes as student advances.

## Environment Variables Required
```
MOODLE_TOKEN=e86dd021aaa42f78114e6c67cc9d8ff1
MOODLE_INTERNAL_URL=http://scli-moodle-dev:8080
```

## Notes
- Cohorts are **created on demand** during acceptance (not pre-created)
- Multiple cohorts can exist for the same programme (different intake years)
- Moodle DB connection pool must be configured in `backend/index.js`
- If REST API fails, system automatically falls back to direct DB queries
