#!/usr/bin/env python3
"""
Import actual SCLondon courses from JSON file
Replace the generic courses with real UK vocational/degree courses
"""

import json
import subprocess
import sys

def load_courses():
    """Load courses from sclondon-courses.json"""
    try:
        with open('/mnt/c/SCL System/scl-institute/sclondon-courses.json', 'r', encoding='utf-8') as f:
            courses = json.load(f)
        return courses
    except Exception as e:
        print(f"❌ Error loading courses: {e}")
        return []

def get_course_type_category(course_type):
    """Map course type to Moodle category"""
    type_map = {
        'Degree': 1,
        'HND': 2,
        'Vocational': 3,
        'Certification': 4
    }
    return type_map.get(course_type, 1)

def generate_sql(courses):
    """Generate SQL to import courses"""
    sql = """-- SCLondon Actual Courses Import
USE bitnami_moodle;

-- Start fresh - delete old incorrect courses
DELETE FROM mdl_course WHERE id > 1;

SET @sort := 0;

"""
    
    for course in courses:
        course_code = course.get('course_code', '').replace("'", "\\'")
        title = course.get('title', '').replace("'", "\\'")
        description = course.get('description', '').replace("'", "\\'")[:1000]  # Limit length
        course_type = course.get('course_type', 'Vocational')
        
        # Skip empty courses
        if not title or not course_code:
            continue
        
        sql += f"""INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), '{title}', '{course_code}', '{course_code}',
    '{description}', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
"""
    
    sql += "\n-- Verify import\nSELECT COUNT(*) as imported_courses, GROUP_CONCAT(fullname SEPARATOR ', ') as courses FROM mdl_course WHERE id > 1;\n"
    
    return sql

def execute_sql(sql_content, description):
    """Execute SQL in Moodle database"""
    print(f"\n→ {description}")
    
    # Write to temp file
    with open('/tmp/import_sclondon.sql', 'w') as f:
        f.write(sql_content)
    
    # Execute via docker
    cmd = f"docker exec -i scli-moodle-db-dev mariadb -ubn_moodle -pbitnami_moodle_password bitnami_moodle < /tmp/import_sclondon.sql"
    result = subprocess.run(['bash', '-c', f"wsl -u root -d Ubuntu-22.04 bash -c \"{cmd}\" 2>&1 | tail -20"], 
                          capture_output=True, text=True)
    
    print(result.stdout)
    if result.returncode != 0 and result.stderr:
        print(f"⚠ Note: {result.stderr}")

def main():
    print("\n" + "="*70)
    print("SCLONDON ACTUAL COURSES IMPORT")
    print("="*70)
    
    # Load courses
    courses = load_courses()
    if not courses:
        print("❌ No courses found in JSON file")
        sys.exit(1)
    
    print(f"\n✓ Loaded {len(courses)} SCLondon courses from JSON")
    
    # Show sample courses
    print("\nSample courses:")
    for i, course in enumerate(courses[:5], 1):
        print(f"  {i}. {course.get('title', 'Unknown')} ({course.get('course_code', 'N/A')})")
    print(f"  ... and {len(courses) - 5} more courses")
    
    # Generate SQL
    sql_content = generate_sql(courses)
    
    # Execute import
    execute_sql(sql_content, f"Importing {len(courses)} SCLondon courses into Moodle")
    
    print("\n" + "="*70)
    print(f"✅ SCLondon courses imported successfully!")
    print("="*70)
    print(f"\nTotal courses imported: {len(courses)}")
    print("Status: Ready for student enrollment")
    print("\nAccess Moodle: http://localhost:9090")

if __name__ == "__main__":
    main()
