-- Create application_reviews table to track review status of applications
-- This table was missing and needed for the admin portal to function correctly

CREATE TABLE IF NOT EXISTS application_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  reviewer_id INT,
  status VARCHAR(50),
  comments TEXT,
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES student_applications(id)
);
