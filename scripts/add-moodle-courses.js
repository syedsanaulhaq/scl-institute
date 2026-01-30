#!/usr/bin/env node
/**
 * Moodle Course Creation Guide
 * Manual steps to add courses to Moodle
 */

console.log('🎯 Moodle Course Setup Guide');
console.log('===============================');
console.log('');
console.log('📋 Manual Setup Required:');
console.log('1. Open Moodle at: http://localhost:9090');
console.log('2. Login with admin credentials (typically admin/bitnami)');
console.log('3. Go to Site administration > Courses > Add/edit courses');
console.log('4. Click "Add a new course" for each course below');
console.log('');
console.log('🎓 Courses to Add:');
console.log('');

// Courses to add (matching our database)
const courses = [
  {
    shortname: 'BUS101',
    fullname: 'Business Administration HND',
    summary: 'Comprehensive business administration program covering management, finance, marketing and operations.',
    category: 'Business Studies',
    duration: '24 months'
  },
  {
    shortname: 'IT201',
    fullname: 'Information Technology Degree',
    summary: 'Bachelor degree in Information Technology covering programming, networks, databases and systems analysis.',
    category: 'Computing',
    duration: '36 months'
  },
  {
    shortname: 'ACC301',
    fullname: 'Accounting and Finance HND',
    summary: 'Professional accounting qualification covering financial reporting, management accounting and taxation.',
    category: 'Business Studies',
    duration: '24 months'
  },
  {
    shortname: 'ENG401',
    fullname: 'English Language Course',
    summary: 'Intensive English language course for international students.',
    category: 'Languages',
    duration: '6 months'
  },
  {
    shortname: 'PROJ501',
    fullname: 'Project Management CPD',
    summary: 'Continuing professional development in project management methodologies.',
    category: 'Professional Development',
    duration: '3 months'
  }
];

courses.forEach((course, index) => {
  console.log(`${index + 1}. Course Details:`);
  console.log(`   Course Name: ${course.fullname}`);
  console.log(`   Course Code: ${course.shortname}`);
  console.log(`   Category: ${course.category}`);
  console.log(`   Duration: ${course.duration}`);
  console.log(`   Description: ${course.summary}`);
  console.log('');
});

console.log('📝 Quick Steps for Each Course:');
console.log('1. Course full name: [Use the name above]');
console.log('2. Course short name: [Use the code above]');
console.log('3. Course category: [Create or select appropriate category]');
console.log('4. Course summary: [Copy description above]');
console.log('5. Course format: Topics format');
console.log('6. Number of sections: 8-12 sections');
console.log('7. Course visibility: Visible');
console.log('8. Click "Save and return" or "Save and display"');
console.log('');
console.log('✅ After adding all courses, your Student Admission Form will');
console.log('   automatically fetch and display these courses from the database!');
console.log('');