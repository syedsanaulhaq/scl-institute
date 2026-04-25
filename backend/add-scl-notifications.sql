-- Add sample notifications to SCL notifications table
-- These will be fetched and displayed on the student dashboard

-- First, check if notifications table exists and has data
-- If not, we'll add some sample data

-- Get a sample student email for testing
SET @student_email = 'test@sclsandbox.xyz';

-- Insert sample notifications
INSERT INTO notifications (email, type, subject, message, body, is_read, created_at, updated_at)
VALUES
(
    @student_email,
    'assignment',
    'Course Assignment Due',
    'You have an assignment due tomorrow. Please submit your work before the deadline.',
    '<p>You have an assignment due tomorrow in Mathematics 101. Please submit your work through the assignment submission tool before midnight.</p>',
    FALSE,
    DATE_SUB(NOW(), INTERVAL 3 HOUR),
    DATE_SUB(NOW(), INTERVAL 3 HOUR)
),
(
    @student_email,
    'resource',
    'New Course Material Available',
    'Your instructor has uploaded new lecture slides and reading materials for next week.',
    '<p>New lecture slides and reading materials for Week 5 are now available in the course resources section. Please review them before the next class.</p>',
    FALSE,
    DATE_SUB(NOW(), INTERVAL 7 HOUR),
    DATE_SUB(NOW(), INTERVAL 7 HOUR)
),
(
    @student_email,
    'announcement',
    'Course Schedule Change',
    'Important: The midterm exam has been rescheduled to next month.',
    '<p>Please note that the midterm exam has been rescheduled from next week to the following week. More details will be provided soon.</p>',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 12 HOUR)
),
(
    @student_email,
    'message',
    'Message from Your Instructor',
    'Your instructor sent you a message regarding your recent assignment.',
    '<p>Hi Student, I wanted to reach out about your recent submission. Great work overall! Please see my detailed feedback in the assignment comments.</p>',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    @student_email,
    'reminder',
    'Course Registration Reminder',
    'Don\'t forget to register for next semester\'s courses before the deadline.',
    '<p>The course registration deadline for next semester is coming up this Friday. Make sure to enroll in all your courses before the deadline passes.</p>',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- Display the created notifications
SELECT id, email, type, subject, message, is_read, created_at FROM notifications WHERE email = @student_email ORDER BY created_at DESC;
