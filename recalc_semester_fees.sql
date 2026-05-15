-- Recalculate all existing fee records to semester schedule
-- total_fee is the TOTAL course fee; divide by number of semesters (2 per year)
UPDATE student_fees sf
JOIN courses c ON c.course_code = CONVERT(sf.course_code USING utf8mb4) COLLATE utf8mb4_0900_ai_ci
SET
  sf.instalment_1_amount = ROUND(sf.total_fee_gbp / CEIL(c.duration_months / 6), 2),
  sf.instalment_1_due    = sf.instalment_1_due,

  sf.instalment_2_amount = ROUND(sf.total_fee_gbp / CEIL(c.duration_months / 6), 2),
  sf.instalment_2_due    = DATE_ADD(sf.instalment_1_due, INTERVAL 6 MONTH),

  sf.instalment_3_amount = ROUND(sf.total_fee_gbp / CEIL(c.duration_months / 6), 2),
  sf.instalment_3_due    = DATE_ADD(sf.instalment_1_due, INTERVAL 12 MONTH),

  sf.instalment_4_amount = sf.total_fee_gbp - (3 * ROUND(sf.total_fee_gbp / CEIL(c.duration_months / 6), 2)),
  sf.instalment_4_due    = DATE_ADD(sf.instalment_1_due, INTERVAL 18 MONTH);

-- Verify
SELECT id, course_code, total_fee_gbp,
       instalment_1_amount, instalment_1_due,
       instalment_2_amount, instalment_2_due,
       instalment_3_amount, instalment_3_due,
       instalment_4_amount, instalment_4_due
FROM student_fees ORDER BY id;
