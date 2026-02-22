-- Create application_documents table

CREATE TABLE IF NOT EXISTS application_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    document_type ENUM(
        'passport_id_document',
        'academic_certificates',
        'academic_transcripts',
        'english_certificate',
        'cv_resume',
        'work_reference',
        'proof_of_address',
        'visa_immigration_document',
        'student_contract',
        'brp_card',
        'residency_proof',
        'other'
    ) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by INT,
    verified_at TIMESTAMP NULL,
    verification_notes TEXT,
    
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_document_type (document_type),
    INDEX idx_verification_status (verification_status)
);

SELECT 'application_documents table created successfully' as status;
