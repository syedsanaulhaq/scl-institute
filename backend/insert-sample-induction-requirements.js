require('dotenv').config();
const pool = require('./db');

async function insertSampleData() {
    let connection;
    try {
        console.log('[SAMPLE DATA] Inserting sample induction requirements...');
        connection = await pool.getConnection();
        
        // Assume course_id = 1 (first induction)
        const courseId = 1;
        
        // Define sections and their requirements
        const sections = [
            {
                section_number: 1,
                section_title: 'Programme Specification & Course Design',
                requirements: [
                    {
                        requirement_area: 'Programme Validation',
                        description: 'Evidence of programme being validated by awarding body',
                        source_reference: 'QAA Code of Practice',
                        evidence_held: 'Validation report',
                        responsible_person: 'Course Leader',
                        compliance_status: true,
                        review_notes: 'Completed and reviewed'
                    },
                    {
                        requirement_area: 'Learning Outcomes',
                        description: 'Clear and measurable learning outcomes defined',
                        source_reference: 'Programme Specification',
                        evidence_held: 'Programme Document',
                        responsible_person: 'Academic Lead',
                        compliance_status: true,
                        review_notes: 'All outcomes documented'
                    },
                    {
                        requirement_area: 'Assessment Strategy',
                        description: 'Comprehensive assessment strategy documented',
                        source_reference: 'Assessment Plan',
                        evidence_held: 'Assessment Document',
                        responsible_person: 'QA Manager',
                        compliance_status: false,
                        review_notes: 'Pending final approval'
                    }
                ]
            },
            {
                section_number: 2,
                section_title: 'Teaching & Learning Strategy',
                requirements: [
                    {
                        requirement_area: 'Teaching Methods',
                        description: 'Range of teaching methods documented',
                        source_reference: 'Teaching Strategy',
                        evidence_held: 'Module Specifications',
                        responsible_person: 'Curriculum Lead',
                        compliance_status: true,
                        review_notes: 'Aligned with learning outcomes'
                    },
                    {
                        requirement_area: 'Staff Qualifications',
                        description: 'All teaching staff have appropriate qualifications',
                        source_reference: 'Staff Records',
                        evidence_held: 'Certificates and CVs',
                        responsible_person: 'HR Manager',
                        compliance_status: true,
                        review_notes: 'All verified'
                    },
                    {
                        requirement_area: 'Learning Resources',
                        description: 'Adequate learning resources available',
                        source_reference: 'Resource Plan',
                        evidence_held: 'Library Reports',
                        responsible_person: 'Library Lead',
                        compliance_status: false,
                        review_notes: 'Awaiting budget allocation'
                    }
                ]
            }
        ];

        for (const section of sections) {
            for (const req of section.requirements) {
                await connection.query(
                    `INSERT INTO induction_requirements (
                        course_id, section_number, section_title, requirement_area,
                        description, source_reference, evidence_held, responsible_person,
                        compliance_status, review_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        courseId,
                        section.section_number,
                        section.section_title,
                        req.requirement_area,
                        req.description,
                        req.source_reference,
                        req.evidence_held,
                        req.responsible_person,
                        req.compliance_status ? 1 : 0,
                        req.review_notes
                    ]
                );
            }
        }
        
        console.log('[SAMPLE DATA] ✅ Sample induction requirements inserted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('[SAMPLE DATA] ❌ Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

insertSampleData();
