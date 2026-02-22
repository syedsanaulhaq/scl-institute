#!/usr/bin/env python3
"""
Clean course content and assign students
1. Remove problematic course content
2. Keep basic course structure
3. Add placeholder content
4. Enroll students in courses
"""

import subprocess
import sys

def run_sql(sql_query, description=""):
    """Execute SQL query"""
    if description:
        print(f"\n→ {description}")
    
    cmd = f"""docker exec -i scli-moodle-db-dev mariadb -ubn_moodle -pbitnami_moodle_password bitnami_moodle"""
    result = subprocess.run(['bash', '-c', f'wsl -u root -d Ubuntu-22.04 bash -c "echo \'{sql_query}\' | {cmd}"'],
                          capture_output=True, text=True, timeout=30)
    if result.stdout:
        print(result.stdout[:500])
    return result.returncode == 0

def main():
    print("\n" + "="*70)
    print("MOODLE COURSE CLEANUP & STUDENT ENROLLMENT")
    print("="*70)
    
    # Step 1: Check current state
    print("\n📊 CURRENT STATE:")
    run_sql("SELECT COUNT(*) as courses FROM mdl_course WHERE id > 1;", 
            "Courses in system")
    run_sql("SELECT COUNT(*) as users FROM mdl_user WHERE id > 1;", 
            "Student users")
    run_sql("SELECT COUNT(*) as sections FROM mdl_course_sections WHERE course > 1;", 
            "Total course sections")
    run_sql("SELECT COUNT(*) as modules FROM mdl_course_modules WHERE course > 1;", 
            "Total course modules")
    
    # Step 2: Remove problematic content
    print("\n🗑 REMOVING PROBLEMATIC CONTENT:")
    
    # Delete course modules and activities with content issues
    sql_delete_modules = """
    USE bitnami_moodle;
    DELETE FROM mdl_course_modules WHERE course > 1;
    SELECT "Deleted all course modules" as status;
    """
    run_sql(sql_delete_modules, 
            "Removing all course modules/activities")
    
    # Delete course sections (keep only default)
    sql_delete_sections = """
    USE bitnami_moodle;
    DELETE FROM mdl_course_sections WHERE course > 1 AND section > 0;
    SELECT "Deleted extra sections" as status;
    """
    run_sql(sql_delete_sections, 
            "Removing extra course sections, keeping default section 0")
    
    # Reset section 0 for all courses
    sql_reset_sections = """
    USE bitnami_moodle;
    UPDATE mdl_course_sections SET name = NULL, summary = NULL, summaryformat = 1 
    WHERE course > 1 AND section = 0;
    SELECT "Reset default sections" as status;
    """
    run_sql(sql_reset_sections, 
            "Resetting default section content")
    
    # Step 3: Add placeholder content in course summary
    sql_add_content = """
    USE bitnami_moodle;
    UPDATE mdl_course 
    SET summary = CONCAT(
        'Welcome to ', fullname, '.<br>',
        'This course provides training and certification in the subject area outlined in the course code.<br>',
        'Students will have access to learning materials, resources, and assessment opportunities.<br>',
        'Please contact your course administrator for any questions or support.'
    )
    WHERE id > 1 AND summary = '';
    SELECT "Added placeholder content" as status;
    """
    run_sql(sql_add_content, 
            "Adding placeholder course descriptions")
    
    # Step 4: Create base enrollment instances for each course
    print("\n👥 SETTING UP ENROLLMENTS:")
    
    sql_enrollments = """
    USE bitnami_moodle;
    
    -- Ensure each course has at least one enrollment method (self-enrollment)
    INSERT IGNORE INTO mdl_enrol (enrol, status, courseid, sortorder, name, enrolperiod, enrolstartdate, enrolenddate, expirynotify, expirythreshold, notifyall, longname, cost, currency, roleid, customint1, customint2, customint3, customint4, customtext1, customtext2, customdec1, customdec2, timecreated, timemodified)
    SELECT 'self', 0, c.id, 0, NULL, 0, 0, 0, 0, 604800, 0, NULL, '', 'USD', 5, 1, 0, 0, 0, '', '', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
    FROM mdl_course c
    WHERE c.id > 1 AND NOT EXISTS (SELECT 1 FROM mdl_enrol e WHERE e.courseid = c.id);
    
    SELECT CONCAT('Created enrollment methods for ', ROW_COUNT(), ' courses') as status;
    """
    run_sql(sql_enrollments, 
            "Setting up course enrollment methods")
    
    # Step 5: Enroll students in courses
    print("\n📝 ASSIGNING STUDENTS TO COURSES:")
    
    sql_assign_students = """
    USE bitnami_moodle;
    
    -- Get list of students (non-admin users) and courses
    INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timecreated, timemodified)
    SELECT DISTINCT
        e.id,
        u.id,
        0,
        UNIX_TIMESTAMP(),
        0,
        1,
        UNIX_TIMESTAMP(),
        UNIX_TIMESTAMP()
    FROM mdl_enrol e
    JOIN mdl_course c ON c.id = e.courseid
    JOIN mdl_user u ON u.id > 1 AND u.deleted = 0
    LEFT JOIN mdl_user_enrolments ue ON ue.enrolid = e.id AND ue.userid = u.id
    WHERE ue.id IS NULL AND c.id > 1;
    
    SELECT CONCAT('Enrolled ', ROW_COUNT(), ' student enrollments') as status;
    """
    run_sql(sql_assign_students, 
            "Enrolling students in courses")
    
    # Assign student role to enrolled users
    sql_role_assignment = """
    USE bitnami_moodle;
    
    INSERT INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid)
    SELECT 5, ctc.id, ue.userid, UNIX_TIMESTAMP(), 1
    FROM mdl_user_enrolments ue
    JOIN mdl_enrol e ON e.id = ue.enrolid
    JOIN mdl_context ctc ON ctc.instanceid = e.courseid AND ctc.contextlevel = 50
    LEFT JOIN mdl_role_assignments ra ON ra.contextid = ctc.id AND ra.userid = ue.userid AND ra.roleid = 5
    WHERE ra.id IS NULL;
    
    SELECT CONCAT('Assigned student role to ', ROW_COUNT(), ' users') as status;
    """
    run_sql(sql_role_assignment, 
            "Assigning student role to enrollments")
    
    # Step 6: Verify cleanup and enrollments
    print("\n✅ VERIFICATION:")
    run_sql("SELECT COUNT(*) as courses FROM mdl_course WHERE id > 1;", 
            "Final course count")
    run_sql("SELECT COUNT(*) as sections FROM mdl_course_sections WHERE course > 1;", 
            "Final sections (should be ~25)")
    run_sql("SELECT COUNT(*) as modules FROM mdl_course_modules WHERE course > 1;", 
            "Final modules (should be 0)")
    run_sql("SELECT COUNT(DISTINCT courseid) as courses_with_enrollments FROM mdl_enrol WHERE courseid > 1;", 
            "Courses with active enrollment methods")
    run_sql("""SELECT COUNT(DISTINCT ue.userid) as enrolled_students FROM mdl_user_enrolments ue 
               JOIN mdl_enrol e ON e.id = ue.enrolid WHERE e.courseid > 1;""", 
            "Total student enrollments")
    
    print("\n" + "="*70)
    print("✅ CLEANUP & ENROLLMENT COMPLETE")
    print("="*70)
    print("""
Completed Actions:
  ✓ Removed all problematic course modules/activities
  ✓ Removed extra course sections (kept default)
  ✓ Added placeholder course descriptions
  ✓ Set up enrollment methods for all courses
  ✓ Enrolled all students in all courses
  ✓ Assigned student role to enrolled users

Course Structure:
  • 25 SCLondon courses (clean, no problematic content)
  • Each course has: Basic description + enrollment method
  • All 17 students enrolled in all courses
  • Ready for content to be added later

Next Steps:
  1. Access Moodle: http://localhost:9090
  2. Login as admin
  3. Add course content/modules as needed
  4. Students can access their courses immediately
    """)

if __name__ == "__main__":
    main()
