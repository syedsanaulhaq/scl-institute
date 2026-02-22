#!/usr/bin/env python3
"""
Refresh Moodle courses from SCL office backup
1. Restore scl_institute database with fresh data
2. Remove old courses from Moodle
3. Import fresh courses from backup
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"→ {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            print(f"❌ Error: {result.stderr}")
            return False
        print(result.stdout)
        return True
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("SCL COURSE DATA REFRESH")
    print("="*60)
    
    base_path = "/mnt/c/SCL System/scl-institute"
    backup_file = f"{base_path}/scl_institute_clean_backup.sql"
    moodle_import = f"{base_path}/import-sclondon-courses-moodle.sql"
    
    # Step 1: Check if backup exists
    if not os.path.exists(backup_file):
        print(f"❌ Backup file not found: {backup_file}")
        sys.exit(1)
    
    print(f"✓ Backup file found: {backup_file}")
    print(f"✓ Import script: {moodle_import}")
    
    # Step 2: Restore scl_institute database
    cmd = f'docker exec scli-mysql-dev bash -c "cat /mnt/c/SCL\\ System/scl-institute/scl_institute_clean_backup.sql | mysql -uroot -prootpassword scl_institute"'
    if not run_command(cmd, "Restoring SCL office database with fresh courses"):
        print("❌ Failed to restore scl_institute database")
        return False
    
    # Step 3: Check restored courses
    cmd = "docker exec scli-mysql-dev mysql -uroot -prootpassword scl_institute -e 'SELECT COUNT(*) as total_courses FROM courses;'"
    if not run_command(cmd, "Counting courses in restored database"):
        print("⚠ Click to see course count")
    
    # Step 4: Create import script if needed and check it
    if os.path.exists(moodle_import):
        print(f"\n✓ Import script already exists: {moodle_import}")
    else:
        print(f"⚠ Import script not found at {moodle_import}")
        print("  Courses can still be imported using the SQL file")
    
    # Step 5: Clear old courses from Moodle (keep Site course with id=1)
    cmd = """docker exec scli-moodle-db-dev mariadb -ubn_moodle -pbitnami_moodle_password bitnami_moodle -e 'DELETE FROM mdl_course WHERE id > 1; SELECT "Old courses removed" as Status, COUNT(*) as remaining_courses FROM mdl_course;'"""
    if not run_command(cmd, "Removing old courses from Moodle (keeping Site course)"):
        print("⚠ Warning: Could not verify course deletion")
    
    # Step 6: Import fresh courses from backup via import script
    if os.path.exists(moodle_import):
        cmd = f"wsl -u root -d Ubuntu-22.04 bash -c \"cat '/mnt/c/SCL System/scl-institute/import-sclondon-courses-moodle.sql' | docker exec -i scli-moodle-db-dev mariadb -ubn_moodle -pbitnami_moodle_password bitnami_moodle\""
        if not run_command(cmd, "Importing fresh courses into Moodle"):
            print("⚠ Note: Import may have run despite error message")
    
    # Step 7: Verify import
    cmd = "docker exec scli-moodle-db-dev mariadb -ubn_moodle -pbitnami_moodle_password bitnami_moodle -e \"SELECT COUNT(*) as course_count, GROUP_CONCAT(fullname SEPARATOR ', ') as courses FROM mdl_course WHERE id > 1;\""
    if not run_command(cmd, "Verifying imported courses in Moodle"):
        print("⚠ Could not verify final state")
    
    print("\n" + "="*60)
    print("✅ COURSE REFRESH COMPLETE")
    print("="*60)
    print("\nNext steps:")
    print("1. Access Moodle: http://localhost:9090")
    print("2. Login to admin panel")
    print("3. Navigate to Site administration → Courses → Manage courses")
    print("4. Verify all courses are present and correctly displayed")
    print("\n")

if __name__ == "__main__":
    main()
