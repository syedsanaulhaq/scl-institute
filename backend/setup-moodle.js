#!/usr/bin/env node
/**
 * Moodle Setup Script
 * Enables web services and creates API token directly in Moodle database
 */

const mysql = require('mysql2/promise');

async function setupMoodle() {
    let connection;
    try {
        // Connect to Moodle database
        connection = await mysql.createConnection({
            host: 'localhost',
            port: 33062, // Moodle MariaDB port
            user: 'bn_moodle',
            password: process.env.MOODLE_DB_PASSWORD || 'password',
            database: 'bitnami_moodle'
        });

        console.log('Connected to Moodle database');

        // Enable web services
        await connection.execute(`
            INSERT INTO mdl_config (plugin, name, value) 
            VALUES ('', 'enablewebservices', '1')
            ON DUPLICATE KEY UPDATE value = '1'
        `);

        console.log('✓ Web services enabled');

        // Enable REST protocol
        await connection.execute(`
            INSERT INTO mdl_config (plugin, name, value) 
            VALUES ('', 'webserviceprotocols', 'rest')
            ON DUPLICATE KEY UPDATE value = 'rest'
        `);

        console.log('✓ REST protocol enabled');

        // Get admin user ID
        const [adminUsers] = await connection.execute(`
            SELECT id FROM mdl_user WHERE username = 'admin' LIMIT 1
        `);

        if (adminUsers.length === 0) {
            throw new Error('Admin user not found');
        }

        const adminUserId = adminUsers[0].id;
        console.log(`✓ Found admin user ID: ${adminUserId}`);

        // Create external service if not exists
        await connection.execute(`
            INSERT IGNORE INTO mdl_external_services (name, enabled, restrictedusers, downloadfiles, uploadfiles, shortname, timecreated, timemodified) 
            VALUES ('SCL Institute Service', 1, 0, 1, 1, 'scl_service', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
        `);

        // Get service ID
        const [services] = await connection.execute(`
            SELECT id FROM mdl_external_services WHERE shortname = 'scl_service'
        `);

        const serviceId = services[0].id;
        console.log(`✓ External service created/found ID: ${serviceId}`);

        // Generate API token
        const token = require('crypto').randomBytes(32).toString('hex');

        // Create API token
        await connection.execute(`
            INSERT INTO mdl_external_tokens (token, userid, externalserviceid, contextid, creatorid, iprestriction, validuntil, timecreated) 
            VALUES (?, ?, ?, 1, ?, '', NULL, UNIX_TIMESTAMP())
            ON DUPLICATE KEY UPDATE token = VALUES(token)
        `, [token, adminUserId, serviceId, adminUserId]);

        console.log(`✓ API token created: ${token}`);

        // Add required functions to service
        const functions = [
            'core_course_create_courses',
            'core_course_get_courses',
            'core_course_get_categories',
            'core_user_create_users'
        ];

        for (const functionName of functions) {
            await connection.execute(`
                INSERT IGNORE INTO mdl_external_services_functions (externalserviceid, functionname) 
                VALUES (?, ?)
            `, [serviceId, functionName]);
        }

        console.log('✓ Required functions added to service');

        console.log('\n🎉 Moodle setup completed!');
        console.log('\n📝 Add this to your backend .env file:');
        console.log(`MOODLE_TOKEN=${token}`);
        console.log('\n🚀 Now you can create courses using: POST /api/moodle/create-courses');

        return token;

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n🔧 Fallback - Manual Setup:');
        console.log('1. Go to http://localhost:9090');
        console.log('2. Login as admin');
        console.log('3. Go to Site administration > Server > Web services');
        console.log('4. Enable web services');
        console.log('5. Enable REST protocol');
        console.log('6. Create external service');
        console.log('7. Create token for admin user');
        return null;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    setupMoodle();
}

module.exports = { setupMoodle };