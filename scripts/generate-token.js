#!/usr/bin/env node
/**
 * Quick Moodle Token Generator
 * Creates a token for testing course creation
 */

const crypto = require('crypto');

// Generate a test token
const token = crypto.randomBytes(32).toString('hex');

console.log('🔑 Generated Moodle API Token:');
console.log(token);
console.log('');
console.log('📋 Manual Setup Steps:');
console.log('1. Go to http://localhost:9090');
console.log('2. Login as admin (user: admin, pass: bitnami)');
console.log('3. Go to Site administration > Server > Web services');
console.log('4. Click "Enable web services" if not enabled');
console.log('5. Go to "External services"');
console.log('6. Enable "Moodle mobile web service"');
console.log('7. Go to "Manage tokens"');
console.log('8. Create token for admin user with this value:');
console.log(`   Token: ${token}`);
console.log('');
console.log('🔧 Or add this to your backend docker-compose.dev.yml:');
console.log(`MOODLE_TOKEN=${token}`);
console.log('');
console.log('🚀 Then restart backend and call: POST /api/moodle/create-courses');