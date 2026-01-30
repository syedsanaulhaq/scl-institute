// ===============================================
// Moodle Integration API Routes
// Handles direct communication with Moodle LMS
// ===============================================

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Moodle configuration
const MOODLE_URL = process.env.MOODLE_URL || 'http://localhost:9090'; // External URL for redirects
const MOODLE_API_URL = 'http://scli-moodle-dev:8080'; // Internal URL for API calls
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '';
const MOODLE_USERNAME = 'admin';
const MOODLE_PASSWORD = 'bitnami';

// Helper function to get Moodle admin session
async function getMoodleSession() {
    try {
        const loginResponse = await axios.post(`${MOODLE_URL}/login/index.php`, {
            username: MOODLE_USERNAME,
            password: MOODLE_PASSWORD
        });
        
        // Extract session cookie
        const cookies = loginResponse.headers['set-cookie'];
        return cookies ? cookies.join('; ') : null;
    } catch (error) {
        console.error('Failed to get Moodle session:', error.message);
        return null;
    }
}

// Helper function to enable web services
async function enableWebServices() {
    try {
        const session = await getMoodleSession();
        if (!session) return false;

        // Enable web services via admin interface
        const enableResponse = await axios.post(`${MOODLE_URL}/admin/settings.php`, {
            enablewebservices: 1,
            s__enablewebservices: 1,
            submitbutton: 'Save changes'
        }, {
            headers: { Cookie: session }
        });

        return true;
    } catch (error) {
        console.error('Failed to enable web services:', error.message);
        return false;
    }
}

// ROUTE 1: POST /api/moodle/setup
// Initialize Moodle web services and create token
router.post('/setup', async (req, res) => {
    try {
        console.log('Setting up Moodle web services...');
        
        // Enable web services
        const webServicesEnabled = await enableWebServices();
        if (!webServicesEnabled) {
            return res.json({
                success: false,
                message: 'Failed to enable web services. Please enable manually in Moodle admin panel.'
            });
        }

        res.json({
            success: true,
            message: 'Moodle setup initiated. Please configure token manually for now.',
            instructions: [
                '1. Go to http://localhost:9090/admin/webservice/tokens.php',
                '2. Create new token for admin user',
                '3. Add token to backend .env as MOODLE_TOKEN=your_token'
            ]
        });

    } catch (error) {
        console.error('Error setting up Moodle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup Moodle integration',
            error: error.message
        });
    }
});

// ROUTE 2: POST /api/moodle/create-courses
// Create courses in Moodle programmatically
router.post('/create-courses', async (req, res) => {
    try {
        if (!MOODLE_TOKEN) {
            return res.status(400).json({
                success: false,
                message: 'MOODLE_TOKEN not configured. Run /api/moodle/setup first.'
            });
        }

        const courses = [
            {
                shortname: 'BUS101',
                fullname: 'Business Administration HND',
                categoryid: 1,
                summary: 'Comprehensive business administration program covering management, finance, marketing and operations.',
                summaryformat: 1,
                format: 'topics',
                numsections: 12,
                visible: 1,
                startdate: Math.floor(Date.now() / 1000),
                enddate: Math.floor((Date.now() + (24 * 30 * 24 * 60 * 60 * 1000)) / 1000)
            },
            {
                shortname: 'IT201',
                fullname: 'Information Technology Degree',
                categoryid: 1,
                summary: 'Bachelor degree in Information Technology covering programming, networks, databases and systems analysis.',
                summaryformat: 1,
                format: 'topics',
                numsections: 18,
                visible: 1,
                startdate: Math.floor(Date.now() / 1000),
                enddate: Math.floor((Date.now() + (36 * 30 * 24 * 60 * 60 * 1000)) / 1000)
            },
            {
                shortname: 'ACC301',
                fullname: 'Accounting and Finance HND',
                categoryid: 1,
                summary: 'Professional accounting qualification covering financial reporting, management accounting and taxation.',
                summaryformat: 1,
                format: 'topics',
                numsections: 12,
                visible: 1,
                startdate: Math.floor(Date.now() / 1000),
                enddate: Math.floor((Date.now() + (24 * 30 * 24 * 60 * 60 * 1000)) / 1000)
            },
            {
                shortname: 'ENG401',
                fullname: 'English Language Course',
                categoryid: 1,
                summary: 'Intensive English language course for international students.',
                summaryformat: 1,
                format: 'topics',
                numsections: 6,
                visible: 1,
                startdate: Math.floor(Date.now() / 1000),
                enddate: Math.floor((Date.now() + (6 * 30 * 24 * 60 * 60 * 1000)) / 1000)
            },
            {
                shortname: 'PROJ501',
                fullname: 'Project Management CPD',
                categoryid: 1,
                summary: 'Continuing professional development in project management methodologies.',
                summaryformat: 1,
                format: 'topics',
                numsections: 3,
                visible: 1,
                startdate: Math.floor(Date.now() / 1000),
                enddate: Math.floor((Date.now() + (3 * 30 * 24 * 60 * 60 * 1000)) / 1000)
            }
        ];

        const createdCourses = [];
        const errors = [];

        for (const course of courses) {
            try {
                const response = await axios.post(`${MOODLE_API_URL}/webservice/rest/server.php`, null, {
                    params: {
                        wstoken: MOODLE_TOKEN,
                        wsfunction: 'core_course_create_courses',
                        moodlewsrestformat: 'json',
                        'courses[0][shortname]': course.shortname,
                        'courses[0][fullname]': course.fullname,
                        'courses[0][categoryid]': course.categoryid,
                        'courses[0][summary]': course.summary,
                        'courses[0][summaryformat]': course.summaryformat,
                        'courses[0][format]': course.format,
                        'courses[0][numsections]': course.numsections,
                        'courses[0][visible]': course.visible,
                        'courses[0][startdate]': course.startdate,
                        'courses[0][enddate]': course.enddate
                    }
                });

                if (response.data && !response.data.exception) {
                    createdCourses.push({
                        shortname: course.shortname,
                        fullname: course.fullname,
                        id: response.data[0]?.id || 'unknown'
                    });
                    console.log(`✓ Created course: ${course.fullname}`);
                } else {
                    errors.push({
                        course: course.fullname,
                        error: response.data.message || 'Unknown error'
                    });
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                errors.push({
                    course: course.fullname,
                    error: error.response?.data?.message || error.message
                });
                console.error(`✗ Failed to create course: ${course.fullname}`, error.response?.data || error.message);
            }
        }

        res.json({
            success: true,
            message: `Course creation completed. Created: ${createdCourses.length}, Errors: ${errors.length}`,
            data: {
                created: createdCourses,
                errors: errors
            }
        });

    } catch (error) {
        console.error('Error creating courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create courses in Moodle',
            error: error.message
        });
    }
});

// ROUTE 3: GET /api/moodle/courses
// Fetch courses directly from Moodle
router.get('/courses', async (req, res) => {
    try {
        if (!MOODLE_TOKEN) {
            return res.status(400).json({
                success: false,
                message: 'MOODLE_TOKEN not configured'
            });
        }

        const response = await axios.post(`${MOODLE_API_URL}/webservice/rest/server.php`, null, {
            params: {
                wstoken: MOODLE_TOKEN,
                wsfunction: 'core_course_get_courses',
                moodlewsrestformat: 'json'
            }
        });

        if (response.data && !response.data.exception) {
            // Filter out site course and format data
            const courses = response.data
                .filter(course => course.id !== 1) // Exclude site course
                .map(course => ({
                    id: course.id,
                    course_code: course.shortname,
                    course_title: course.fullname,
                    course_type: course.categoryname || 'General',
                    department: course.categoryname || 'General',
                    description: course.summary || '',
                    moodle_course_id: course.id
                }));

            res.json({
                success: true,
                message: `Fetched ${courses.length} courses from Moodle`,
                data: courses
            });
        } else {
            res.status(400).json({
                success: false,
                message: response.data.message || 'Failed to fetch courses from Moodle',
                error: response.data
            });
        }

    } catch (error) {
        console.error('Error fetching courses from Moodle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch courses from Moodle',
            error: error.message
        });
    }
});

// ROUTE 4: POST /api/moodle/auto-token
// Automatically create API token in Moodle
router.post('/auto-token', async (req, res) => {
    try {
        // This is a simplified approach - in reality, token creation requires admin panel access
        res.json({
            success: false,
            message: 'Auto token creation not yet implemented',
            instructions: [
                '1. Login to Moodle as admin at http://localhost:9090',
                '2. Go to Site administration > Server > Web services',
                '3. Click "Enable web services"',
                '4. Go to "External services" and enable "Moodle mobile web service"', 
                '5. Go to "Manage tokens" and create token for admin user',
                '6. Copy token and add to backend .env: MOODLE_TOKEN=your_token_here'
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in auto-token generation',
            error: error.message
        });
    }
});

module.exports = router;