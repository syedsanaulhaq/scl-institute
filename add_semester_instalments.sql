-- Add 4th semester instalment columns and update existing records

ALTER TABLE student_fees
  ADD COLUMN instalment_4_amount  decimal(10,2) DEFAULT 0.00 AFTER instalment_3_paid_at,
  ADD COLUMN instalment_4_due     date          DEFAULT NULL AFTER instalment_4_amount,
  ADD COLUMN instalment_4_paid    tinyint(1)    DEFAULT 0    AFTER instalment_4_due,
  ADD COLUMN instalment_4_paid_at datetime      DEFAULT NULL AFTER instalment_4_paid;

-- Recalculate: total_fee stays the same (it IS the total).
-- 2-year course = 4 semesters of 6 months each.
-- per_semester = total_fee / 4  (rounded to 2dp, last semester absorbs rounding)
UPDATE student_fees sf
JOIN courses c ON c.course_code = sf.course_code
SET
  sf.instalment_1_amount = ROUND(sf.total_fee_gbp / (CEIL(c.duration_months / 6)), 2),
  sf.instalment_1_due    = sf.instalment_1_due,   -- keep original intake start date

  sf.instalment_2_amount = ROUND(sf.total_fee_gbp / (CEIL(c.duration_months / 6)), 2),
  sf.instalment_2_due    = DATE_ADD(sf.instalment_1_due, INTERVAL 6 MONTH),

  sf.instalment_3_amount = ROUND(sf.total_fee_gbp / (CEIL(c.duration_months / 6)), 2),
  sf.instalment_3_due    = DATE_ADD(sf.instalment_1_due, INTERVAL 12 MONTH),

  sf.instalment_4_amount = sf.total_fee_gbp - (3 * ROUND(sf.total_fee_gbp / (CEIL(c.duration_months / 6)), 2)),
  sf.instalment_4_due    = DATE_ADD(sf.instalment_1_due, INTERVAL 18 MONTH)
WHERE c.duration_months >= 24;

-- Verify
SELECT id, course_code, total_fee_gbp,
       instalment_1_amount, instalment_1_due,
       instalment_2_amount, instalment_2_due,
       instalment_3_amount, instalment_3_due,
       instalment_4_amount, instalment_4_due
FROM student_fees ORDER BY id;
