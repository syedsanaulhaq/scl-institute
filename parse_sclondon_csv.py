#!/usr/bin/env python3
import csv
import sys

csv_file = '/mnt/c/SCL System/scl-institute/sclondon-courses.csv'

try:
    with open(csv_file, 'r', encoding='latin1') as f:
        reader = csv.DictReader(f)
        courses = list(reader)
        
    print(f'✓ Total courses in CSV: {len(courses)}')
    print(f'\nFirst 5 courses:')
    for i, course in enumerate(courses[:5], 1):
        code = course.get('course_code', 'N/A')
        title = course.get('title', 'Unknown')[:50]
        print(f'{i}. {code} - {title}')
        
    # Generate SQL
    sql_lines = [
        "-- SCLondon Actual Courses Import",
        "USE bitnami_moodle;",
        "",
        "-- Delete old incorrect courses",
        "DELETE FROM mdl_course WHERE id > 1;",
        "",
        "SET @sort := 0;",
        ""
    ]
    
    for course in courses:
        code = course.get('course_code', '').strip()
        title = course.get('title', '').strip()
        
        if not code or not title:
            continue
            
        # Escape single quotes for SQL
        code = code.replace("'", "''")
        title = title.replace("'", "''")
        desc = (course.get('description', '').strip() or 'No description')[:500]
        desc = desc.replace("'", "''")
        
        sql_lines.append(f"""INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), '{title}', '{code}', '{code}',
    '{desc}', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);""")
    
    # Write SQL file
    sql_content = '\n'.join(sql_lines)
    with open('/mnt/c/SCL System/scl-institute/sclondon_moodle_import.sql', 'w') as f:
        f.write(sql_content)
    
    print(f'\n✓ Generated SQL for {len(courses)} courses')
    print(f'✓ Saved to: /mnt/c/SCL System/scl-institute/sclondon_moodle_import.sql')
    
except Exception as e:
    print(f'❌ Error: {e}')
    sys.exit(1)
