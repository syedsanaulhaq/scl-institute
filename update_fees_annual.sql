-- Update existing fee records to annual year-based schedule
-- HND = 2 years at £8,500/year = £17,000 total
-- Year 1 due = instalment_1_due (unchanged, intake start date)
-- Year 2 due = intake start date + 12 months

UPDATE student_fees sf
JOIN student_applications sa ON sa.id = sf.application_id
JOIN courses c ON c.course_code = sf.course_code
SET
    sf.total_fee_gbp       = 8500.00 * CEIL(c.duration_months / 12),
    sf.instalment_1_amount = 8500.00,
    sf.instalment_2_amount = CASE WHEN CEIL(c.duration_months / 12) >= 2 THEN 8500.00 ELSE 0.00 END,
    sf.instalment_2_due    = CASE WHEN CEIL(c.duration_months / 12) >= 2
                               THEN DATE_ADD(sf.instalment_1_due, INTERVAL 1 YEAR)
                               ELSE sf.instalment_2_due END,
    sf.instalment_3_amount = CASE WHEN CEIL(c.duration_months / 12) >= 3 THEN 8500.00 ELSE 0.00 END,
    sf.instalment_3_due    = CASE WHEN CEIL(c.duration_months / 12) >= 3
                               THEN DATE_ADD(sf.instalment_1_due, INTERVAL 2 YEAR)
                               ELSE sf.instalment_3_due END
WHERE sf.fee_status != 'paid';

-- Verify
SELECT id, course_code, total_fee_gbp,
       instalment_1_amount, instalment_1_due,
       instalment_2_amount, instalment_2_due,
       instalment_3_amount, instalment_3_due
FROM student_fees ORDER BY id;
