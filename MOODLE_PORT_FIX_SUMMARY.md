# ✅ Moodle Port Mapping Issue - ROOT CAUSE & SOLUTION

**Issue Found:** The Docker port mapping was incorrect  
**Solution Implemented:** Changed from `8080:80` to `8080:8080`  
**Status:** ✅ **FIXED - Moodle now accessible at http://185.211.6.60:8080**

---

## 🔍 Root Cause Analysis

### The Problem
- Bitnami Moodle container's Apache server **listens on port 8080 internally**, not port 80
- Docker compose was mapping: `8080:80` (Host port 8080 → Container port 80)
- Apache on container port 8080 had no mapping from the host
- Result: "Connection refused" error

### Why Local Worked
Local Docker setup used the same image but was accessible because:
1. Local setup was using port forwarding appropriately  
2. Bitnami Moodle's Apache is preconfigured to listen on 8080
3. Container was initializing properly with database connection

### Why Server Failed Initially
1. docker-compose.prod.yml had wrong port mapping: `8080:80`
2. Moodle DB missing earlier (separate issue now fixed)  
3. NGINX was trying to proxy to port 80 which didn't exist
4. Port 8080 listening on host but nothing responding on it

---

## 🛠️ Solution Implemented

### Changes Made

**1. Docker Compose Port Mapping**
```yaml
# BEFORE (WRONG):
ports:
  - "8080:80"

# AFTER (CORRECT):
ports:
  - "8080:8080"
```

**2. NGINX Proxy Configuration**
```nginx
# BEFORE (WRONG):
proxy_pass http://scli-moodle:80;

# AFTER (CORRECT):
proxy_pass http://scli-moodle:8080;
```

**3. Reverse Proxy Setting**
```yaml
# Temporarily disabled for direct access testing:
- MOODLE_REVERSEPROXY=no  # (Changed from yes)
```

**4. File Permissions**
```bash
# Fixed SSO plugin directory permissions
chown -R daemon:daemon /opt/bitnami/moodle/local/sclsso
chmod -R 755 /opt/bitnami/moodle/local/sclsso
chmod -R 755 /bitnami/moodledata
```

---

## 📊 Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| HTTP Request to Port 8080 | `ERR_CONNECTION_REFUSED` | ✅ HTTP 200 OK |
| Moodle Homepage | Not accessible | ✅ Loads successfully |
| NGINX proxy to Moodle | 502 Bad Gateway | ✅ Routing correctly |
| Docker Port Mapping | `8080:80` (wrong) | `8080:8080` (correct) |
| Apache Listening | Port 8080 (no host mapping) | Port 8080 (host mapped) |

---

## ✅ What's Now Working

1. **Direct Access:** `http://185.211.6.60:8080/` → Moodle homepage loads
2. **Port Availability:** Port 8080 accepts and responds to requests
3. **Database:** MariaDB database initializes properly
4. **Applications:** All services (backend, frontend, NGINX) running and healthy
5. **SSO Plugin:** Installed and enabled in Moodle

---

## 🔄 Connection Flow (Now Fixed)

```
User Browser (Port 8080)
    ↓
docker-proxy (Listening on host:8080)
    ↓
Docker Container (Port 8080 mapping)
    ↓
Apache/Moodle (Listening on 127.0.0.1:8080)
    ↓
MariaDB Database ✅
```

**Before (Broken):**
```
User Browser (Port 8080)
    ↓
docker-proxy (Listening on host:8080)
    ↓
Docker Container (Port 80 mapping) ❌ WRONG PORT
    ↓
Apache/Moodle (Listening on 127.0.0.1:8080) not mapped
    ↓
Connection Refused ❌
```

---

## 📝 Git Commits

| Commit | Changes |
|--------|---------|
| `3b7a4a9` | Disable MOODLE_REVERSEPROXY for direct access testing |
| `e90d679` | Fix: correct docker port mapping 8080:80 → 8080:8080 and NGINX proxy |
| `93c8c26` | Fix: NGINX proxy config |
| `114709a` | Add MariaDB database + Moodle env vars |

---

## 🚀 How to Test Now

### Test 1: Direct IP Access
```bash
curl -I http://185.211.6.60:8080/
# Expected: HTTP/1.1 200 OK
```

### Test 2: Verify Port Listening
```bash
ssh root@185.211.6.60
ss -tlnp | grep 8080
# Expected: LISTEN    0      4096  0.0.0.0:8080
```

### Test 3: Check Moodle Homepage
Open browser: `http://185.211.6.60:8080`
- You should see Moodle homepage
- Title: "Home | SCL Institute LMS"
- Login link available
- Powered by Bitnami label visible

### Test 4: Verify Service Health
```bash
ssh root@185.211.6.60
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml ps
# Should show all services UP and HEALTHY
```

---

## 💡 Key Learnings

1. **Port Mapping Must Match:** Host:Container ports must match where the application listens
2. **Bitnami Images:** Come with services pre-configured on specific ports - must verify before mapping
3. **Docker-proxy:** Listens on host port but needs correct container port mapping
4. **Local vs Production:** Always verify port configurations are identical between environments
5. **Testing Sequence:** Check Docker logs → Check port listening → Check HTTP response → Debug application-level

---

## ⚠️ Notes for Production

- **MOODLE_REVERSEPROXY=no** is currently set for testing
- For production with NGINX reverse proxy: Should be set back to `yes`
- Requires proper domain (lms.sclsandbox.xyz) configured in NGINX and Moodle wwwroot
- All containers are running with proper restart policies
- Data persists in Docker volumes

---

## 📞 Issue Resolution Summary

**Time to Identify:** ~2 hours of troubleshooting  
**Root Cause:** Single line in docker-compose.yml (8080:80 should be 8080:8080)  
**Fix Complexity:** Simple (2-line change)  
**Impact:** Complete Moodle access restored

This is a great reminder that simple configuration mistakes can cause major functionality issues. Always verify:
1. Port numbers match application documentation
2. Docker port mapping syntax: `HOST:CONTAINER`
3. Reverse proxy targets match actual listening ports

---

**Status:** ✅ RESOLVED  
**Date:** January 26, 2026  
**Current Access:** http://185.211.6.60:8080
