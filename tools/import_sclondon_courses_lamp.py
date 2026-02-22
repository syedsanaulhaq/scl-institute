#!/usr/bin/env python3
"""Import SCLondon courses into LAMP Moodle (categories + courses only)."""

import csv
import subprocess
import sys
from pathlib import Path

CSV_PATH = Path(r"/mnt/c/SCL System/scl-institute/sclondon-courses.csv")
DB_NAME = "moodle"
# -N: skip column names, -B: batch (tab-delimited)
MYSQL_CMD = ["mysql", "-u", "root", "-N", "-B", DB_NAME]

CATEGORY_ORDER = [
    "Degree",
    "HND",
    "Vocational",
    "Certification",
    "CPD",
    "Short Course",
]


def run_mysql(sql: str) -> str:
    proc = subprocess.run(
        MYSQL_CMD,
        input=sql.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", errors="ignore").strip())
    return proc.stdout.decode("utf-8", errors="ignore").strip()


def escape_sql(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def load_courses():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")
    courses = []
    with CSV_PATH.open("r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = (row.get("title") or "").strip()
            code = (row.get("course_code") or "").strip()
            course_type = (row.get("course_type") or "").strip() or "Vocational"
            summary = (row.get("description") or "").strip()
            if not title or not code:
                continue
            courses.append(
                {
                    "title": title,
                    "code": code,
                    "course_type": course_type,
                    "summary": summary[:1000],
                }
            )
    return courses


def ensure_categories(course_types):
    # Add default category names if missing
    for name in CATEGORY_ORDER:
        run_mysql(
            """
INSERT INTO mdl_course_categories (name, parent, sortorder, coursecount, visible, visibleold, timemodified)
SELECT '{name}', 0, (SELECT COALESCE(MAX(sortorder), 0) + 1 FROM mdl_course_categories), 0, 1, 1, UNIX_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM mdl_course_categories WHERE name = '{name}');
""".format(name=escape_sql(name))
        )

    # Add any extra types from CSV
    for name in sorted(set(course_types) - set(CATEGORY_ORDER)):
        run_mysql(
            """
INSERT INTO mdl_course_categories (name, parent, sortorder, coursecount, visible, visibleold, timemodified)
SELECT '{name}', 0, (SELECT COALESCE(MAX(sortorder), 0) + 1 FROM mdl_course_categories), 0, 1, 1, UNIX_TIMESTAMP()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM mdl_course_categories WHERE name = '{name}');
""".format(name=escape_sql(name))
        )


def fetch_category_map():
    output = run_mysql("SELECT id, name FROM mdl_course_categories;")
    mapping = {}
    for line in output.splitlines():
        parts = line.split("\t")
        if len(parts) == 2:
            mapping[parts[1]] = int(parts[0])
    return mapping


def fetch_existing_idnumbers():
    output = run_mysql("SELECT idnumber FROM mdl_course WHERE idnumber IS NOT NULL;")
    return {line.strip() for line in output.splitlines() if line.strip()}


def insert_courses(courses, category_map, existing):
    sort = int(run_mysql("SELECT COALESCE(MAX(sortorder), 0) FROM mdl_course;") or 0)
    inserted = 0
    for course in courses:
        if course["code"] in existing:
            continue
        category_id = category_map.get(course["course_type"], 1)
        sort += 1
        sql = """
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    {category}, {sort}, '{title}', '{code}', '{code}', '{summary}',
    1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0,
    0, 0, 0, 0, 0,
    1, 1, 0, 0, 0,
    '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0,
    0, 0, 0, 0
);
""".format(
            category=category_id,
            sort=sort,
            title=escape_sql(course["title"]),
            code=escape_sql(course["code"]),
            summary=escape_sql(course["summary"]),
        )
        run_mysql(sql)
        inserted += 1
    return inserted


def main():
    courses = load_courses()
    if not courses:
        print("No courses found.")
        return 1

    course_types = [c["course_type"] for c in courses]
    ensure_categories(course_types)
    category_map = fetch_category_map()
    existing = fetch_existing_idnumbers()

    inserted = insert_courses(courses, category_map, existing)
    print(f"Imported {inserted} new courses. Total CSV rows: {len(courses)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
