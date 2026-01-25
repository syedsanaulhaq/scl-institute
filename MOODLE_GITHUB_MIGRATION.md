# Moodle Database Migration via GitHub

## Quick Setup from Local to Server

### On Your Local Machine:

1. **Export your local Moodle database:**
   ```bash
   cd scripts
   bash export-moodle-db.sh
   ```
   This creates `moodle-backup/moodle_backup.sql` with your local setup

2. **Commit and push to GitHub:**
   ```bash
   git add moodle-backup/
   git commit -m "Add Moodle database backup for server deployment"
   git push origin main
   ```

### On the Server (185.211.6.60):

1. **Pull latest code with backup:**
   ```bash
   cd /opt/scl-institute
   git pull origin main
   ```

2. **Upload the backup file to server:**
   ```bash
   # From your local machine:
   scp moodle-backup/moodle_backup.sql root@185.211.6.60:/tmp/
   ```

3. **Restore the database:**
   ```bash
   # SSH into server:
   ssh root@185.211.6.60
   
   # Run the restore script:
   cd /opt/scl-institute
   bash scripts/restore-moodle-db.sh
   ```

## What This Does:

- ✅ Exports your perfectly configured local Moodle
- ✅ Commits it to GitHub (for version control)
- ✅ Server pulls the latest code
- ✅ Restores your exact Moodle database with all settings/users/courses
- ✅ All custom plugins (SSO, etc.) are already in `moodle-scripts/`

## Result:

Your server Moodle will be identical to your local version - no restart loops, all configuration preserved!
