require('dotenv').config();
const pool = require('./db');

// Add course_code column to course_accreditations table if it doesn't exist
const migration = async () => {
    try {
        console.log('Running migration: Adding course_code column to course_accreditations...');
        
        // Check if column exists
        const checkResult = await pool.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'course_accreditations' AND COLUMN_NAME = 'course_code'`
        );
        
        if (checkResult.length === 0) {
            // Column doesn't exist, add it
            await pool.query(
                `ALTER TABLE course_accreditations 
                 ADD COLUMN course_code VARCHAR(100) AFTER course_title`
            );
            console.log('✓ Successfully added course_code column to course_accreditations table');
        } else {
            console.log('✓ course_code column already exists');
        }
        
        // Also add to inductions table if needed
        const inductionCheckResult = await pool.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'inductions' AND COLUMN_NAME = 'course_code'`
        );
        
        if (inductionCheckResult.length === 0) {
            await pool.query(
                `ALTER TABLE inductions 
                 ADD COLUMN course_code VARCHAR(100) AFTER course_title`
            );
            console.log('✓ Successfully added course_code column to inductions table');
        } else {
            console.log('✓ course_code column already exists in inductions table');
        }
        
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migration();
