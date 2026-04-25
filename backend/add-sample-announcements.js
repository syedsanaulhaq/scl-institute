// Script to add sample announcements to Moodle courses
// This helps populate the announcements for the student dashboard

require('dotenv').config();
const mysql = require('mysql2/promise');

const moodlePool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'moodle',
    charset: 'utf8mb4'
});

const sampleAnnouncements = [
    {
        subject: 'Welcome to the Course',
        message: '<p>Welcome to this course! We are excited to have you join us. Please take time to explore the course content and familiarize yourself with the course structure.</p>'
    },
    {
        subject: 'Important: Assignment Deadline',
        message: '<p>Please remember that the first assignment is due next Friday. Submit your work through the assignment submission tool before midnight.</p>'
    },
    {
        subject: 'Course Materials Updated',
        message: '<p>New lecture slides and reading materials have been uploaded to the course resources section. Please review them at your earliest convenience.</p>'
    },
    {
        subject: 'Midterm Exam Schedule',
        message: '<p>The midterm exam will be held next month. More details about the exam format and topics will be provided soon.</p>'
    },
    {
        subject: 'Discussion Forum Guidelines',
        message: '<p>Please remember to follow our community guidelines when posting in the discussion forums. Be respectful and constructive in your interactions with fellow students.</p>'
    }
];

async function addAnnouncements() {
    let conn = null;
    try {
        conn = await moodlePool.getConnection();
        
        // Get active courses (with enrollments)
        const [courses] = await conn.execute(`
            SELECT DISTINCT c.id, c.fullname, c.shortname
            FROM mdl_course c
            JOIN mdl_enrol e ON e.courseid = c.id
            JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
            WHERE c.id > 1
            ORDER BY c.id DESC
            LIMIT 5
        `);

        console.log(`Found ${courses.length} active courses`);

        let announcementCount = 0;

        for (const course of courses) {
            console.log(`\nProcessing course: ${course.fullname} (ID: ${course.id})`);

            // Find or create the news forum for this course
            let [forums] = await conn.execute(
                'SELECT id FROM mdl_forum WHERE course = ? AND type = "news"',
                [course.id]
            );

            let forumId;
            if (forums.length === 0) {
                console.log('  - No news forum found, creating one...');
                // Create news forum
                const [result] = await conn.execute(`
                    INSERT INTO mdl_forum (course, name, intro, type, assessed, assesstimestart, assesstimeend, scale, maxbytes, timemodified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [course.id, 'Announcements', '', 'news', 0, 0, 0, 0, -1, Math.floor(Date.now() / 1000)]);
                forumId = result.insertId;
            } else {
                forumId = forums[0].id;
            }

            // Get admin user for posting announcements
            const [users] = await conn.execute('SELECT id FROM mdl_user WHERE username = "admin" LIMIT 1');
            const adminUserId = users.length > 0 ? users[0].id : 2; // Default to user 2 if admin not found

            // Add sample announcements to this forum
            const announcementsToAdd = sampleAnnouncements.slice(0, 3); // Add 3 announcements per course
            const now = Math.floor(Date.now() / 1000);

            for (let i = 0; i < announcementsToAdd.length; i++) {
                const ann = announcementsToAdd[i];

                try {
                    // Create forum discussion
                    const [diskResult] = await conn.execute(`
                        INSERT INTO mdl_forum_discussions (forum, name, firstpost, userid, modified, timestart, timeend)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [forumId, ann.subject, 0, adminUserId, now - (i * 86400), 0, 0]);

                    const discussionId = diskResult.insertId;

                    // Create forum post
                    const [postResult] = await conn.execute(`
                        INSERT INTO mdl_forum_posts (discussion, parent, userid, created, modified, message)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [discussionId, 0, adminUserId, now - (i * 86400), now - (i * 86400), ann.message]);

                    const postId = postResult.insertId;

                    // Update discussion with first post ID
                    await conn.execute(
                        'UPDATE mdl_forum_discussions SET firstpost = ? WHERE id = ?',
                        [postId, discussionId]
                    );

                    console.log(`  ✓ Added announcement: "${ann.subject}"`);
                    announcementCount++;
                } catch (err) {
                    console.error(`  ✗ Failed to add announcement: ${err.message}`);
                }
            }
        }

        console.log(`\n✅ Successfully added ${announcementCount} announcements to Moodle courses`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        await moodlePool.end();
    }
}

addAnnouncements();
