require('dotenv').config();
const pool = require('./db');

async function insertSampleData() {
    let connection;
    try {
        console.log('[SAMPLE DATA] Inserting sample accreditations...');
        connection = await pool.getConnection();
        
        // Insert a sample accreditation
        const accreditationResult = await connection.query(
            `INSERT INTO course_accreditations (
                course_title, awarding_body, application_type, date_started, 
                expected_submission_date, lead_coordinator, version, overall_status, completion_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'Business Management with Accounting',
                'University of Greenwich',
                'New Course Validation',
                new Date('2024-01-15'),
                new Date('2024-06-30'),
                'Dr. James Smith',
                '1.0',
                'In Progress',
                45
            ]
        );
        
        const accreditationId = accreditationResult[0].insertId;
        console.log(`[SAMPLE DATA] Created accreditation with ID: ${accreditationId}`);
        
        // Insert sample tasks for 8 sections
        const sections = [
            { section: 1, title: 'Programme Specification & Design' },
            { section: 2, title: 'Teaching & Learning Strategy' },
            { section: 3, title: 'Assessment Strategy' },
            { section: 4, title: 'Quality Assurance & Enhancement' },
            { section: 5, title: 'Resources & Academic Support' },
            { section: 6, title: 'Student Support & Guidance' },
            { section: 7, title: 'Admissions & Student Progress' },
            { section: 8, title: 'Governance & Management' }
        ];
        
        for (const section of sections) {
            const tasks = [
                {
                    name: `${section.title} - Document 1`,
                    description: 'Complete and submit documentation',
                    evidence: 'MSWord Document',
                    responsible: 'Course Leader',
                    due: new Date(new Date().setDate(new Date().getDate() + 30))
                },
                {
                    name: `${section.title} - Review 1`,
                    description: 'Internal review and approval',
                    evidence: 'Meeting Minutes',
                    responsible: 'Programme Coordinator',
                    due: new Date(new Date().setDate(new Date().getDate() + 45))
                }
            ];
            
            for (const task of tasks) {
                await connection.query(
                    `INSERT INTO accreditation_tasks (
                        accreditation_id, section_number, section_title, task_name, 
                        description, evidence_required, responsible_person, due_date, status, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        accreditationId, section.section, section.title, task.name,
                        task.description, task.evidence, task.responsible, task.due,
                        'Not Started', 'Awaiting action'
                    ]
                );
            }
        }
        
        console.log('[SAMPLE DATA] ✅ Inserted sample tasks');
        
        // Insert sample risks
        await connection.query(
            `INSERT INTO accreditation_risks (
                accreditation_id, risk_issue, impact, mitigation, owner, status, review_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                accreditationId,
                'Late submission of essential documentation',
                'High - Could delay validation',
                'Assign dedicated project manager; establish weekly check-ins',
                'Programme Lead',
                'Active',
                new Date()
            ]
        );
        
        console.log('[SAMPLE DATA] ✅ Inserted sample risks');
        
        // Insert sample signoffs
        await connection.query(
            `INSERT INTO accreditation_signoffs (
                accreditation_id, role, name, sign_date
            ) VALUES (?, ?, ?, ?)`,
            [accreditationId, 'Lead Coordinator', 'Dr. James Smith', null]
        );
        
        await connection.query(
            `INSERT INTO accreditation_signoffs (
                accreditation_id, role, name, sign_date
            ) VALUES (?, ?, ?, ?)`,
            [accreditationId, 'Quality Assurance Manager', 'Sarah Johnson', null]
        );
        
        console.log('[SAMPLE DATA] ✅ Inserted sample sign-offs');
        console.log('[SAMPLE DATA] ✅ All sample data inserted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('[SAMPLE DATA] ❌ Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

insertSampleData();
