# Moodle SSO Plugin Setup Guide

**Status:** ⏳ Plugin files in place, awaiting registration  
**Version:** 1.0  
**Date:** January 25, 2026

---

## Overview

The SCL SSO (Single Sign-On) plugin allows users to log in to Moodle using their SCL Institute accounts. The plugin verifies tokens with the backend API and automatically creates/syncs Moodle user accounts.

---

## Architecture

```
Frontend (React)
    ↓ (user clicks "LMS" button)
SSO Token Generator (/api/sso/generate)
    ↓ (generates security token)
User redirects to →
Moodle /local/sclsso/login.php?token=XYZ
    ↓
Backend Verification (/api/sso/verify)
    ↓ (validates token)
Create/Update Moodle User
    ↓
Auto-login to Moodle
    ↓
Redirect to Dashboard
```

---

## LOCAL DEVELOPMENT SETUP

### Current Status
- ✅ Plugin files copied to container: `/bitnami/moodle/local/sclsso/`
- ✅ File permissions correct: `-rwxr-xr-x`
- ⏳ Moodle plugin discovery: NOT triggered yet
- ❌ Plugin route: Currently returning 404

### File Locations
```
Inside Container: /bitnami/moodle/local/sclsso/
├── version.php              (plugin metadata)
├── login.php               (SSO verification logic)
└── lang/
    └── en/
        └── local_sclsso.php (language strings)

From Host: e:\SCL-Projects\SCL-Institute\moodle-scripts\
├── version.php
├── login.php
└── lang/en/local_sclsso.php
```

### Step 1: Verify Plugin Files (ALREADY DONE)

```powershell
# Verify files exist in container
docker exec scli-moodle-dev ls -la /bitnami/moodle/local/sclsso/

# Expected output:
# login.php      (2956 bytes)
# version.php    (236 bytes)
# lang/          (directory)
```

Should show:
```
-rwxr-xr-x   login.php
-rwxr-xr-x   version.php
drwxr-xr-x   lang/
```

### Step 2: Trigger Moodle Plugin Discovery

**Option A: Via Moodle Web Interface (RECOMMENDED)**

1. **Access Moodle Admin:**
   - URL: http://localhost:8080/admin/
   - Username: `admin`
   - Password: `SCLInst!2026`

2. **Navigate to Plugin Management:**
   - Admin → System administration → Plugins → Plugin overview
   
3. **Locate Local Plugins Section:**
   - Look for "SCL SSO" or "local_sclsso"
   - Should show "Not installed" or "Install"
   
4. **Install Plugin:**
   - Click "Install" button
   - Wait for installation (10-30 seconds)
   - Should show "Plugin installed successfully"

**Option B: Via Moodle CLI (If UI fails)**

```powershell
# Purge caches (forces discovery scan)
docker exec scli-moodle-dev php admin/cli/purge_caches.php

# Verify plugin discovered
docker exec scli-moodle-dev php admin/cli/plugin_manager.php

# Watch logs during scanning
docker logs scli-moodle-dev -f
```

### Step 3: Verify Plugin Installation

```powershell
# Check Moodle logs for success
docker logs scli-moodle-dev | Select-String "local_sclsso" -Context 2

# Query database for plugin installation
docker exec scli-moodle-dev mysql -u moodle -pmoodle moodle -e "SELECT * FROM mdl_config_plugins WHERE plugin = 'local_sclsso';"

# Should return rows (not empty)
```

### Step 4: Test Plugin Route

```powershell
# Test with sample token
$response = Invoke-WebRequest `
    -Uri "http://localhost:8080/local/sclsso/login.php?token=test-token-123" `
    -UseBasicParsing `
    -ErrorAction SilentlyContinue

Write-Host "Status: $($response.StatusCode)"

# Expected: 400 or 401 (invalid token - NOT 404)
# If 404: Plugin not registered yet
```

### Step 5: Verify Backend Connectivity

```powershell
# Verify Moodle can reach backend
docker exec scli-moodle-dev curl -v http://scli-backend-dev:4000/api/sso/verify

# Should show:
# - TLS/Connection success
# - HTTP response headers
# - No "connection refused" errors

# Test SSO verification
$json = @{ token = "test"; secret = "test" } | ConvertTo-Json
docker exec scli-moodle-dev curl -X POST http://scli-backend-dev:4000/api/sso/verify `
    -H "Content-Type: application/json" `
    -d '$json'
```

---

## FRONTEND INTEGRATION

### Generate SSO Token

1. **Frontend calls backend:**
   ```javascript
   // In React component (Login.jsx or similar)
   const response = await fetch('http://localhost:4000/api/sso/generate', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: userEmail })
   });
   
   const { token } = await response.json();
   ```

2. **Redirect to Moodle:**
   ```javascript
   // Redirect to Moodle SSO login with token
   window.location.href = `http://localhost:8080/local/sclsso/login.php?token=${token}`;
   ```

3. **Expected Flow:**
   - User sees login form → clicks "Learning Management System" button
   - Frontend redirects to Moodle SSO endpoint with token
   - Plugin validates token with backend
   - User automatically logged in
   - Redirected to Moodle dashboard

---

## PRODUCTION SERVER SETUP

### Deploying to Server

**Step 1: Copy Plugin Files to Server**

```bash
# On server (185.211.6.60)
ssh root@185.211.6.60

# Navigate to project
cd /opt/scl-institute

# Copy plugin files
docker cp /opt/scl-institute/moodle-scripts/version.php scli-moodle-prod:/bitnami/moodle/local/sclsso/
docker cp /opt/scl-institute/moodle-scripts/login.php scli-moodle-prod:/bitnami/moodle/local/sclsso/
docker cp /opt/scl-institute/moodle-scripts/lang scli-moodle-prod:/bitnami/moodle/local/sclsso/

# Verify files
docker exec scli-moodle-prod ls -la /bitnami/moodle/local/sclsso/
```

**Step 2: Trigger Plugin Discovery**

```bash
# Option A: Via CLI
docker exec scli-moodle-prod php admin/cli/purge_caches.php

# Option B: Via Web Interface
# Access: http://lms.sclsandbox.xyz/admin/
# Admin → Plugins → Plugin overview → Install local_sclsso
```

**Step 3: Configure Backend URL**

In Moodle admin, set backend API endpoint:
- Admin → System administration → Plugins → Local plugins → SCL SSO
- Backend URL: `http://scli-backend:4000/api/sso/verify` (internal)
- Or: `http://185.211.6.60:4000/api/sso/verify` (external)

**Step 4: Test Production SSO**

```bash
# Generate token
curl -X POST http://sclsandbox.xyz/api/sso/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com"}'

# Should return: {"token": "xxx", "expires": ...}

# Test Moodle SSO endpoint (test token, expect validation error)
curl -v http://lms.sclsandbox.xyz/local/sclsso/login.php?token=test-token

# Should return: 400/401 (not 404)
```

---

## PLUGIN CODE OVERVIEW

### version.php
```php
<?php
$plugin->component = 'local_sclsso';
$plugin->version = 2024011500;
$plugin->requires = 201905300;  // Moodle 3.7
$plugin->release = '1.0';
$plugin->maturity = MATURITY_STABLE;
?>
```

**Purpose:** Metadata for Moodle plugin discovery

### login.php (Core Logic)
```php
// 1. Get token from URL
$token = $_GET['token'] ?? null;

// 2. Verify token with backend
$verification = backend_verify_token($token);

// 3. Create/update Moodle user
$user = ensure_user_exists($verification['email']);

// 4. Auto-login
complete_user_login($user);

// 5. Redirect to dashboard
redirect('/my/');
```

**Purpose:** Handles SSO authentication flow

### lang/en/local_sclsso.php
```php
<?php
$string['pluginname'] = 'SCL SSO';
$string['plugindesc'] = 'Single Sign-On from SCL Institute';
?>
```

**Purpose:** Display names and descriptions in Moodle UI

---

## TESTING CHECKLIST

### Pre-Installation Tests
- [ ] Plugin files exist in container
- [ ] File permissions are correct (-rwxr-xr-x)
- [ ] Moodle container is running
- [ ] Backend container is running and accessible

### Installation Tests
- [ ] Moodle admin interface accessible
- [ ] Plugin discovery scans detect "local_sclsso"
- [ ] Plugin installs without errors
- [ ] No database errors in logs

### Functionality Tests
- [ ] SSO token can be generated: `/api/sso/generate` → 200
- [ ] Token verification works: `/api/sso/verify` → valid response
- [ ] Moodle can reach backend: `curl http://scli-backend:4000`
- [ ] SSO login endpoint accessible: `/local/sclsso/login.php` → not 404
- [ ] Invalid token returns 401 (not 404)
- [ ] Valid token creates Moodle user
- [ ] User auto-logged in and redirected to dashboard

### End-to-End Tests
- [ ] Click LMS button on frontend
- [ ] Frontend generates token
- [ ] Frontend redirects to Moodle SSO
- [ ] User automatically logged in
- [ ] User sees Moodle dashboard
- [ ] No PHP errors in logs
- [ ] User created in Moodle database

---

## TROUBLESHOOTING

### Problem: Plugin Returns 404

**Cause:** Plugin not registered/discovered by Moodle

**Solution:**
```powershell
# 1. Verify files exist
docker exec scli-moodle-dev ls -la /bitnami/moodle/local/sclsso/

# 2. Trigger discovery
docker exec scli-moodle-dev php admin/cli/purge_caches.php

# 3. Check logs
docker logs scli-moodle-dev | Select-String "local_sclsso"

# 4. Access admin interface and install manually
# http://localhost:8080/admin/ → Plugins → Plugin overview
```

### Problem: Token Verification Fails

**Cause:** Backend not accessible from Moodle container

**Solution:**
```powershell
# 1. Test connectivity from Moodle container
docker exec scli-moodle-dev curl -v http://scli-backend-dev:4000/

# 2. Check backend logs
docker logs scli-backend-dev

# 3. Verify they're on same network
docker network inspect scl-institute_scl-network-dev

# 4. Check firewall rules
```

### Problem: User Not Created in Moodle

**Cause:** Database not initialized or permission issues

**Solution:**
```powershell
# 1. Check Moodle logs
docker logs scli-moodle-dev | Select-String error -Context 3

# 2. Verify database
docker exec scli-moodle-db-dev mysql -u moodle -pmoodle moodle -e "SELECT * FROM mdl_user LIMIT 5;"

# 3. Check plugin code permissions
docker exec scli-moodle-dev chmod -R 755 /bitnami/moodle/local/sclsso/
```

### Problem: "Installation completed successfully" but 404 persists

**Cause:** Moodle caches not cleared after file copy

**Solution:**
```powershell
# 1. Purge all Moodle caches
docker exec scli-moodle-dev php admin/cli/purge_caches.php

# 2. Restart Moodle container
docker-compose -f docker-compose.dev.yml restart scli-moodle-dev

# 3. Wait 2-3 minutes for full initialization
Start-Sleep -Seconds 180

# 4. Test again
$response = Invoke-WebRequest -Uri "http://localhost:8080/local/sclsso/login.php" -UseBasicParsing -ErrorAction SilentlyContinue
$response.StatusCode
```

### Problem: PHP Errors in Login

**Cause:** Plugin code errors

**Solution:**
```powershell
# 1. Check PHP errors
docker logs scli-moodle-dev | Select-String "PHP" -Context 2

# 2. Enable debug mode in Moodle
# Admin → System administration → Development → Debugging
# Set to "All messages, all warnings, all notices"

# 3. Check /bitnami/moodle/local/sclsso/login.php syntax
docker exec scli-moodle-dev php -l /bitnami/moodle/local/sclsso/login.php
```

---

## MONITORING & DEBUGGING

### Enable Moodle Debug Logging

```powershell
# Access Moodle admin
# http://localhost:8080/admin/settings/debugging

# Set:
# - Debug messages: All messages, all warnings, all notices
# - Log file size: 100 MB
# - Log inactive users: Enabled

# View logs
docker logs scli-moodle-dev -f
```

### Monitor Plugin Usage

```powershell
# Query Moodle database for SSO usage
docker exec scli-moodle-dev mysql -u moodle -pmoodle moodle -e "
SELECT 
    u.email, 
    u.firstlogin, 
    u.lastlogin 
FROM mdl_user u 
WHERE u.email LIKE '%@scl%' 
ORDER BY u.lastlogin DESC;
"
```

### Check Plugin Configuration

```powershell
# View plugin settings in database
docker exec scli-moodle-dev mysql -u moodle -pmoodle moodle -e "
SELECT * FROM mdl_config_plugins 
WHERE plugin = 'local_sclsso' OR plugin = 'auth_sso';
"
```

---

## NEXT STEPS

1. ✅ Files deployed to container
2. ⏳ **[CURRENT] Trigger plugin discovery** (use web interface or CLI)
3. ⏳ Test token generation and verification
4. ⏳ Test full SSO flow from frontend
5. ⏳ Deploy to production server
6. ⏳ Configure SSL/HTTPS
7. ⏳ User role synchronization

---

## QUICK COMMANDS

**Test if Moodle is running:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing | Select-Object StatusCode
```

**Trigger plugin discovery:**
```powershell
docker exec scli-moodle-dev php admin/cli/purge_caches.php
```

**View plugin files:**
```powershell
docker exec scli-moodle-dev ls -la /bitnami/moodle/local/sclsso/
```

**Test SSO endpoint:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/local/sclsso/login.php?token=test" -UseBasicParsing -ErrorAction SilentlyContinue | Select-Object StatusCode
```

**View Moodle logs:**
```powershell
docker logs scli-moodle-dev -f
```

---

## Support

For issues, consult:
1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - General setup & commands
2. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment configuration
3. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick command reference
4. Moodle logs: `docker logs scli-moodle-dev`
5. Backend logs: `docker logs scli-backend-dev`

---

**Last Updated:** Jan 25, 2026  
**Version:** 1.0 (Initial Release)
