# Moodle Attendance Plugin Installation

**Date:** February 23, 2026
**Status:** ✅ Installed

## Installation Details

- **Plugin:** Moodle Attendance Module (mod_attendance)
- **Repository:** https://github.com/danmarsden/moodle-mod_attendance
- **Branch:** MOODLE_405_STABLE
- **Installation Method:** Git clone from stable branch
- **Installation Directory:** `/var/www/moodle-9090/mod/attendance/`

## Version Compatibility

- **Plugin Requires:** `2024092700` (Moodle 4.5+)
- **Supported Versions:** `[405, 405]` (Moodle 4.5)
- **Moodle Instance:** 4.5.10+ (Build 2024100710)

## Installation Process

1. Cloned attendance plugin from MOODLE_405_STABLE branch
2. Moved plugin to `/var/www/moodle-9090/mod/attendance/`
3. Plugin files cached with proper permissions

## Next Steps

1. Navigate to http://localhost:9090/admin/index.php
2. Moodle will detect the new Attendance plugin
3. Click "Upgrade Moodle database now"
4. System will create attendance tables:
   - `mdl_attendance`
   - `mdl_attendance_sessions`
   - `mdl_attendance_log`
   - `mdl_attendance_statuses`
   - And related support tables

## Features Available Once Activated

- Course attendance tracking
- Student attendance marking
- Session management
- Attendance reports
- QR code support
- Mobile app integration

## Plugin Configuration

After upgrade, configure under:
- Site Administration → Plugins → Activity modules → Attendance

## Troubleshooting

If upgrade fails:
1. Check Moodle error logs at `/var/www/moodle-9090/moodledata/`
2. Verify plugin directory permissions: `ls -la /var/www/moodle-9090/mod/attendance/`
3. Check database connectivity

## Related Documentation

- [Moodle Attendance Plugin Docs](https://moodle.org/plugins/view.php?plugin=mod_attendance)
- [GitHub Repository](https://github.com/danmarsden/moodle-mod_attendance)
