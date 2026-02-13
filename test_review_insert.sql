-- Insert a test review for application #7
INSERT INTO application_reviews (
    application_id, reviewer_id, review_stage,
    academic_suitability, english_proficiency_adequate, documentation_complete,
    work_experience_relevant, recommendation, review_notes,
    reviewed_at
) VALUES (
    7, 1, 'final_decision',
    'suitable', TRUE, TRUE,
    FALSE, 'accept', 
    '{"reviewer_name":"John Admin","review_date":"2026-02-13","documents_verified":"Yes","eligibility_check":"Meets criteria","interview_conducted":"No","interview_outcome":"","english_requirement_met":"Yes","additional_notes":"Good academic background and meets all requirements.","decision":"Offer","reason_for_refusal":"","detailed_comments":"Student has demonstrated strong qualifications. Recommended for admission.","committee_chair_name":"Dr. Sarah Johnson","final_decision_date":"2026-02-13","final_decision_confirmation":true}',
    NOW()
);

SELECT 'Test review created successfully' as status;
SELECT * FROM application_reviews WHERE application_id = 7;
