# Moodle Admin Role Assignment - Implementation Summary

**Status**: ✅ Complete - Ready for Testing  
**Date**: February 7, 2026  
**Component**: Moodle SSO Plugin Role Assignment

---

## Overview

Updated the Moodle SSO login system to automatically assign admin roles to users who have admin privileges in the SCL system. This ensures that administrators in SCL are also administrators in Moodle.

---

## Changes Made

### File: `moodle-scripts/local/sclsso/login.php`

#### 1. **Added Role Mapping Function** (Lines 1-48)
```php
function assignMoodleRoles($userid, $sclRole)
```

This function:
- Accepts Moodle user ID and SCL role name
- Maps SCL roles to Moodle roles using a predefined mapping table
- Assigns the appropriate Moodle role at system context (all courses)
- Logs all role assignments for debugging

#### 2. **Role Mapping Table**
```
SCL Role                  →  Moodle Role        Explanation
─────────────────────────────────────────────────────────────
Super Admin               →  manager            Full system access
LMS Manager              →  manager            Learning platform admin
Admissions Officer       →  manager            Administrative access
Faculty & HR Manager     →  manager            Administrative access
Teacher                  →  editingteacher     Can edit courses
Manager                  →  manager            Administrative access
```

#### 3. **Updated Token Data Retrieval** (Lines 57-73)
- Now queries SCL database to get the user's actual role from `user_roles` junction table
- Stores role in `$sclRole` variable for role assignment
- Added debug logging for role retrieval

#### 4. **Added Role Assignment Call** (Line 123)
```php
assignMoodleRoles($user->id, $sclRole);
```
- Called immediately after user is created or updated
- Executes before user login to ensure roles are set

---

## Technical Implementation

### Database Queries

**1. Get User Role from SCL System:**
```sql
SELECT r.name 
FROM user_roles ur 
JOIN roles r ON ur.role_id = r.id 
WHERE ur.user_id = (SELECT id FROM users WHERE email = ?) 
LIMIT 1
```

**2. Verify Moodle Role:**
```sql
SELECT id FROM mdl_role WHERE shortname = 'manager'
```

**3. Assign Role (using Moodle API):**
```php
role_assign($role->id, $userid, $context->id);
```

### Error Handling
- Logs detailed error messages if role is not found
- Logs detailed error messages if Moodle role doesn't exist
- Gracefully handles missing roles (continues without crashing)

---

## Testing Instructions

### Quick Test (2 minutes)

1. **Get Admin SSO Token:**
   ```bash
   curl -X POST http://localhost:4000/api/sso/generate \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sclsandbox.xyz"}'
   ```
   Copy the returned `token` value

2. **Access SSO Login URL:**
   ```
   http://localhost:9090/local/sclsso/login.php?token=<TOKEN_HERE>
   ```

3. **Verify Role in Moodle:**
   - After login, go to: http://localhost:9090/admin/user.php
   - Search for admin@sclsandbox.xyz
   - Check "Roles" section
   - Should show "Manager" role assigned

4. **Check Logs:**
   ```bash
   docker logs scli-moodle-dev | grep "SSO.*Role"
   ```
   Should show:
   ```
   [SSO] Assigning roles for user [ID] with SCL role: Super Admin
   [SSO] Role assigned: user [ID] assigned Moodle role manager (ID: [ROLE_ID])
   ```

### Comprehensive Test

**Admin Users to Test:**
1. `admin@sclsandbox.xyz` (Super Admin)
2. `lmsmanager@scl.edu` (LMS Manager)
3. `admissions@scl.edu` (Admissions Officer)
4. `hr@scl.edu` (Faculty & HR Manager)

**Expected Results:**
- All should get "Manager" role in Moodle
- All should have full administrative capabilities
- Can edit courses, manage users, view logs, etc.

**Teacher User to Test:**
1. `dr.ahmed.cs@scl.edu` (Teacher)

**Expected Result:**
- Should get "Editing Teacher" role in Moodle
- Can edit their enrolled courses
- Cannot access system administration

### Database Verification

**Check user roles in Moodle:**
```bash
docker exec scli-moodle-db-dev mysql -u root -pmoodleroot bitnami_moodle -e \
"SELECT u.email, r.name as moodle_role 
 FROM mdl_user u 
 LEFT JOIN mdl_role_assignments ra ON u.id = ra.userid 
 LEFT JOIN mdl_role r ON ra.roleid = r.id 
 WHERE u.email LIKE '%@scl%' OR u.email = 'admin@sclsandbox.xyz' 
 ORDER BY u.email;"
```

---

## Deployment Verification

### ✅ File Deployed to Moodle
```bash
docker cp moodle-scripts/local/sclsso/login.php scli-moodle-dev:/bitnami/moodle/local/sclsso/login.php
```

### ✅ PHP Syntax Verified
```bash
docker exec scli-moodle-dev php -l /bitnami/moodle/local/sclsso/login.php
# Output: No syntax errors detected
```

### ✅ Git Committed
```bash
git commit -m "Add role assignment for admin users in Moodle SSO login"
Commit: 790eb87
```

---

## How It Works - Step by Step

### User Login Flow:

```
1. Admin clicks "SSO Login" or accesses token URL
   ↓
2. Moodle SSO plugin receives token
   ↓
3. Validates token from SCL sso_tokens table
   ↓
4. Retrieves user's SCL role from user_roles + roles tables
   ↓
5. Maps SCL role to Moodle role (e.g., "Super Admin" → "manager")
   ↓
6. Creates or updates Moodle user account
   ↓
7. Calls assignMoodleRoles() function
   ↓
8. Function finds Moodle role by shortname
   ↓
9. Uses Moodle role_assign() API to assign role
   ↓
10. Logs assignment: "[SSO] Role assigned: user X assigned Moodle role manager"
   ↓
11. Completes user login
   ↓
12. Redirects to Moodle courses or specified activity
```

---

## Log Entry Examples

### When Super Admin logs in:
```
[SSO] Token data retrieved: email=admin@sclsandbox.xyz, role=Super Admin, redirect_url=NULL
[SSO] New user created: admin@sclsandbox.xyz (ID: 5)
[SSO] Assigning roles for user 5 with SCL role: Super Admin
[SSO] Role assigned: user 5 assigned Moodle role manager (ID: 1)
[SSO] User logged in: admin@sclsandbox.xyz
[SSO] No redirect URL, redirecting to courses
```

### When Teacher logs in:
```
[SSO] Token data retrieved: email=dr.ahmed.cs@scl.edu, role=Teacher, redirect_url=NULL
[SSO] Existing user updated: dr.ahmed.cs@scl.edu
[SSO] Assigning roles for user 3 with SCL role: Teacher
[SSO] Role assigned: user 3 assigned Moodle role editingteacher (ID: 4)
[SSO] User logged in: dr.ahmed.cs@scl.edu
[SSO] No redirect URL, redirecting to courses
```

---

## Security Considerations

✅ **Role Validation:** Only assigns roles that exist in Moodle  
✅ **Source Authentication:** Verifies token from SCL database  
✅ **Error Logging:** All role assignments logged for audit trail  
✅ **Context Restriction:** Roles assigned at system level (not individual courses)  
✅ **SQL Prepared Statements:** All database queries use prepared statements  

---

## Troubleshooting

### Issue: Admin user not getting manager role

**Check 1:** Verify token was generated correctly
```bash
mysql> SELECT email, role FROM sso_tokens WHERE token = '<TOKEN>' LIMIT 1;
```

**Check 2:** Verify SCL role in database
```bash
mysql> SELECT r.name FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.id 
       WHERE ur.user_id = (SELECT id FROM users WHERE email = 'admin@sclsandbox.xyz') LIMIT 1;
```

**Check 3:** Check Moodle logs
```bash
docker logs scli-moodle-dev | grep "SSO.*Role"
```

**Check 4:** Verify Moodle role exists
```bash
docker exec scli-moodle-db-dev mysql -u root -pmoodleroot bitnami_moodle -e \
"SELECT id, shortname, name FROM mdl_role WHERE shortname IN ('manager', 'editingteacher');"
```

### Issue: PHP syntax error

**Solution:**
```bash
docker exec scli-moodle-dev php -l /bitnami/moodle/local/sclsso/login.php
```

If error shown, recompare with moodle-scripts/local/sclsso/login.php locally

---

## Rollback Instructions

If needed to revert:
```bash
git revert 790eb87
git reset --hard HEAD~1
docker cp moodle-scripts/local/sclsso/login.php scli-moodle-dev:/bitnami/moodle/local/sclsso/login.php
```

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| moodle-scripts/local/sclsso/login.php | Added role assignment function and logic | +65 |

## Files Deployed

| File | Location | Size |
|------|----------|------|
| login.php | /bitnami/moodle/local/sclsso/login.php | 8.19kB |

---

## Next Steps

1. ✅ Deployment complete
2. ⏳ Test SSO login with admin user
3. ⏳ Verify Manager role appears in Moodle
4. ⏳ Test with all admin user types
5. ⏳ Test with teacher users (should get Editing Teacher role)
6. ⏳ Confirm full administrative functionality for admins

---

**Testing Command:**
```
Generate token → Access SSO URL → Login to Moodle → Check user role → Verify "Manager" assigned
```

**Status: READY FOR TESTING**
