// Backfill fee records for accepted applications
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'scl_user',
    password: process.env.DB_PASS || 'SclSecurePass2024!',
    database: process.env.DB_NAME || 'scl_institute',
    waitForConnections: true
  });

  // Get accepted apps
  const [apps] = await pool.execute(
    `SELECT id, first_name, last_name, email, course_code, COALESCE(intake_start_date,'2026-09-01') as intake_date 
     FROM student_applications WHERE application_status IN ('accepted','conditional_accept')`
  );
  console.log(`Found ${apps.length} accepted applications`);

  for (const app of apps) {
    const { id, first_name, last_name, email, course_code, intake_date } = app;
    const studentName = `${first_name} ${last_name}`.trim();

    // Check if fee already exists
    const [existing] = await pool.execute(
      'SELECT id FROM student_fees WHERE application_id = ? LIMIT 1', [id]
    );
    if (existing.length > 0) {
      console.log(`  App ${id} (${studentName}): fee already exists (id=${existing[0].id}), skipping`);
      continue;
    }

    // Get induction Section 5 fee info
    const [indRows] = await pool.execute(
      `SELECT ci.id as induction_id, ci.course_title 
       FROM course_inductions ci WHERE ci.course_code = ? ORDER BY ci.id DESC LIMIT 1`,
      [course_code]
    );

    let totalFee = 0, inductionId = null, courseTitle = course_code;
    if (indRows.length > 0) {
      inductionId = indRows[0].induction_id;
      courseTitle = indRows[0].course_title || course_code;

      const [sec5] = await pool.execute(
        `SELECT requirement_area, description, review_notes FROM induction_requirements 
         WHERE induction_id = ? AND section_number = 5`,
        [inductionId]
      );

      for (const row of sec5) {
        const area = String(row.requirement_area || '').toLowerCase();
        if (area.includes('tuition') || area.includes('student tuition')) {
          const combined = `${row.description || ''} ${row.review_notes || ''}`;
          const match = combined.match(/[£$]?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:GBP|gbp|per year|\/year)?/);
          if (match) {
            const val = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(val) && val > 0) totalFee = val;
          }
        }
      }
    }

    // Build instalments
    const startDate = new Date(intake_date);
    const inst2Due = new Date(startDate); inst2Due.setMonth(inst2Due.getMonth() + 3);
    const inst3Due = new Date(startDate); inst3Due.setMonth(inst3Due.getMonth() + 6);
    const perInst = totalFee > 0 ? parseFloat((totalFee / 3).toFixed(2)) : 0;
    const lastInst = totalFee > 0 ? parseFloat((totalFee - perInst * 2).toFixed(2)) : 0;
    const fmtDate = d => d.toISOString().split('T')[0];

    const [result] = await pool.execute(`
      INSERT INTO student_fees 
        (application_id, course_code, course_title, student_name, student_email,
         total_fee_gbp, instalment_1_amount, instalment_1_due,
         instalment_2_amount, instalment_2_due, instalment_3_amount, instalment_3_due,
         fee_status, source, induction_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      id, course_code, courseTitle, studentName, email,
      totalFee, perInst, fmtDate(startDate),
      perInst, fmtDate(inst2Due),
      lastInst, fmtDate(inst3Due),
      totalFee > 0 ? 'unpaid' : 'waived',
      'induction', inductionId
    ]);

    console.log(`  App ${id} (${studentName}) [${course_code}]: CREATED fee id=${result.insertId}, total=£${totalFee}`);
  }

  const [counts] = await pool.execute('SELECT COUNT(*) as cnt FROM student_fees');
  console.log(`\nTotal fee records now: ${counts[0].cnt}`);
  await pool.end();
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
