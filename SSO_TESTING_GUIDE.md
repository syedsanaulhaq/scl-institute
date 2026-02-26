# SSO End-to-End Testing Guide

## Quick Health Check

```bash
# On production server (185.211.6.60)

# 1. Check Docker services
docker ps --format "table {{.Names}}\t{{.Status}}"

# 2. Check Moodle installation
ls -la /var/www/moodle-prod/config.php
ls -la /var/www/moodle-prod/local/sclsso/login.php

# 3. Check Apache
systemctl status apache2

# 4. Check database connectivity
mysql -u moodleuser -pmoodlepass -e "SELECT COUNT(*) as 'Moodle Tables' FROM information_schema.tables WHERE table_schema='moodle';"

# 5. Check backend health
curl http://localhost:4000/api/health
```

---

## Test Scenario 1: Token Generation

### Step 1: Generate SSO Token via Backend API

```bash
# From local machine or production server
curl -X POST http://localhost:4000/api/sso/generate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sclsandbox.xyz"
  }'

# Expected response:
# {
#   "success": true,
#   "redirectUrl": "http://lms.sclsandbox.xyz:8888/local/sclsso/login.php?token=uuid-here"
# }
```

### Step 2: Copy the Token

```
Token: (the UUID from redirectUrl query parameter)
```

---

## Test Scenario 2: SSO Login Flow

### Step 1: Open Moodle SSO Login URL

```
http://lms.sclsandbox.xyz:8888/local/sclsso/login.php?token=YOUR-TOKEN-HERE
```

### Step 2: Expected Behavior

1. ✓ Token received by Moodle `login.php`
2. ✓ Token verified with backend via cURL (local API call)
3. ✓ User data returned from backend
4. ✓ User created or updated in Moodle database
5. ✓ Roles assigned based on SCL role mapping
6. ✓ Moodle session created
7. ✓ Redirect to Moodle dashboard
8. ✓ User logged in automatically

### Step 3: Verify in Moodle

- Check user exists: http://lms.sclsandbox.xyz:8888/admin/user.php
- Check user role: Click user → Edit profile → Roles
- Check site admins: http://lms.sclsandbox.xyz:8888/admin/settings.php?section=adminsettings

---

## Test Scenario 3: Frontend Integration (Dashboard Module)

### Step 1: Login to Main System

```
URL: http://system.sclsandbox.xyz
Email: admin@sclsandbox.xyz
Password: password123
```

### Step 2: Navigate to Dashboard

```
Main Menu → Dashboard
```

### Step 3: Click "Learning Management (Moodle)" Module

The button should:
1. Call `/api/sso/generate` with user email
2. Receive redirectUrl from backend
3. Open Moodle in new window via SSO token
4. User automatically logged into Moodle

### Step 4: Verify Success

- [ ] Moodle dashboard loads without login prompt
- [ ] User name appears in Moodle
- [ ] Can access courses
- [ ] Can see enrolled categories

---

## Test Scenario 4: Role-Based Access

### Admin Tests

1. **Super Admin** should:
   - [ ] Become Moodle Manager
   - [ ] Be added to site admins
   - [ ] See admin menu in Moodle
   - [ ] Can manage courses and users

2. **LMS Manager** should:
   - [ ] Become Moodle Manager
   - [ ] Can manage LMS settings

3. **Teacher** should:
   - [ ] Become Moodle Editing Teacher
   - [ ] Can create and edit courses
   - [ ] Cannot access site admin

### Student Tests

1. **Student** should:
   - [ ] Login successfully
   - [ ] See enrolled courses
   - [ ] Cannot access admin features

---

## Debugging Checklist

### If token generation fails:

```bash
# Check backend is running
docker ps | grep scli-backend-prod

# Check backend logs
docker logs scli-backend-prod | tail -20

# Test backend API
curl http://localhost:4000/api/health

# Check users table
docker exec scli-mysql-prod mysql -u scl_user -p"scl_password" -e "SELECT email, first_name, role FROM scl_institute.users LIMIT 5;"
```

### If SSO login fails:

```bash
# Check Moodle SSO plugin files
ls -la /var/www/moodle-prod/local/sclsso/

# Check Moodle config.php has section for SSO
grep -A 5 "SCL SSO" /var/www/moodle-prod/config.php

# Check Apache error log
sudo tail -f /var/log/apache2/error.log

# Check Moodle logs
sudo tail -f /var/www/moodle-prod/sso_errors.log 2>/dev/null || echo "No log file yet"

# Test Moodle connectivity to backend
ssh -o StrictHostKeyChecking=no root@185.211.6.60 "curl -v http://localhost:4000/api/health"
```

### If roles not assigned:

```bash
# Check Moodle user table
mysql -u moodleuser -pmoodlepass moodle -e "SELECT id, email, firstname, lastname FROM mdl_user WHERE email='admin@sclsandbox.xyz';"

# Check role assignments
mysql -u moodleuser -pmoodlepass moodle -e "SELECT usr.email, rol.shortname FROM mdl_role_assignments ra JOIN mdl_role rol ON ra.roleid = rol.id JOIN mdl_user usr ON ra.userid = usr.id WHERE usr.email='admin@sclsandbox.xyz';"

# Check site admins
mysql -u moodleuser -pmoodlepass moodle -e "SELECT value FROM mdl_config WHERE name = 'siteadmins';"
```

---

## Environment Variables Verification

### On Production Server

```bash
# Check environment variables are set
env | grep -E "(SCL_|SSO_|MOODLE_)"

# Check Apache can see environment variables
sudo -u www-data env | grep -E "(SCL_|SSO_)"

# Check Moodle environment loading
sudo php -r "echo getenv('SCL_BACKEND_HOST') . PHP_EOL;"
```

---

## Security Verification

### Token Security

- [ ] Tokens are UUIDs (random, not guessable)
- [ ] Tokens deleted after first use (can't reuse)
- [ ] Token stored temporarily in `sso_tokens` table
- [ ] No token stored in frontend/browser

### Secret Key Security

- [ ] SSO_SECRET is not default value
- [ ] SSO_SECRET not visible in frontend code
- [ ] Backend validates secret before returning user data
- [ ] Secret rotated periodically (in production)

### Session Security

- [ ] HTTP cookies are `secure` flag enabled (HTTPS only)
- [ ] Has `httponly` flag to prevent XSS
- [ ] Has `samesite=Lax` to prevent CSRF
- [ ] Session timeout configured (28800 seconds = 8 hours)

---

## Performance Verification

### Response Times

```bash
# Test token generation response time
time curl -X POST http://localhost:4000/api/sso/generate \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@sclsandbox.xyz" }'

# Expected: < 200ms

# Test Moodle login response time
time curl http://lms.sclsandbox.xyz:8888/local/sclsso/login.php?token=test-token

# Expected: < 500ms (including database operations)
```

### Database Performance

```bash
# Check slow queries (on Moodle database)
mysql -u moodleuser -pmoodlepass moodle -e "SHOW PROCESSLIST;"

# Check SSO token table size
mysql -u moodleuser -pmoodlepass moodle -e "SELECT TABLE_NAME, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.TABLES WHERE table_schema = 'moodle' AND table_name LIKE '%sso%';"
```

---

## Automated Test Script

```bash
#!/bin/bash
# save as: test-sso-flow.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== SSO End-to-End Test ===${NC}\n"

# Test 1: Backend health
echo -e "${YELLOW}[1] Testing backend health...${NC}"
if curl -s http://localhost:4000/api/health | grep -q OK; then
    echo -e "${GREEN}✓ Backend responding${NC}"
else
    echo -e "${RED}✗ Backend unreachable${NC}"
    exit 1
fi

# Test 2: Token generation
echo -e "${YELLOW}[2] Generating SSO token...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/sso/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sclsandbox.xyz"}')

if echo "$TOKEN_RESPONSE" | grep -q '"success":true'; then
    TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"redirectUrl":"[^"]*"' | cut -d'"' -f4 | grep -o 'token=[^\"]*' | cut -d= -f2)
    echo -e "${GREEN}✓ Token generated: ${TOKEN:0:20}...${NC}"
else
    echo -e "${RED}✗ Token generation failed${NC}"
    echo "$TOKEN_RESPONSE"
    exit 1
fi

# Test 3: Moodle accessibility
echo -e "${YELLOW}[3] Checking Moodle...${NC}"
if curl -s http://lms.sclsandbox.xyz:8888 | grep -q '<html'; then
    echo -e "${GREEN}✓ Moodle accessible${NC}"
else
    echo -e "${RED}✗ Moodle unreachable${NC}"
    exit 1
fi

# Test 4: SSO plugin
echo -e "${YELLOW}[4] Checking SSO plugin files...${NC}"
if ssh root@185.211.6.60 test -f /var/www/moodle-prod/local/sclsso/login.php; then
    echo -e "${GREEN}✓ SSO plugin installed${NC}"
else
    echo -e "${RED}✗ SSO plugin missing${NC}"
    exit 1
fi

# Test 5: Database connectivity
echo -e "${YELLOW}[5] Checking Moodle database...${NC}"
TABLE_COUNT=$(ssh root@185.211.6.60 "mysql -u moodleuser -pmoodlepass -se 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=\"moodle\";' 2>/dev/null")
if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Moodle database has $TABLE_COUNT tables${NC}"
else
    echo -e "${RED}✗ Moodle database inaccessible${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== All Tests Passed ===${NC}"
echo -e "\n${YELLOW}Next: Access Moodle via Dashboard module${NC}"
```

---

## Rollback Procedure

If something goes wrong:

```bash
# 1. Restore SSO plugin backup
ssh root@185.211.6.60 "cp -r /var/backups/moodle-sso-*/sclsso /var/www/moodle-prod/local/"

# 2. Restore Moodle database from backup
ssh root@185.211.6.60 "mysql -u moodleuser -pmoodlepass moodle < /var/backups/moodle-*.sql"

# 3. Restart Apache
ssh root@185.211.6.60 "sudo systemctl restart apache2"

# 4. Verify
ssh root@185.211.6.60 "curl http://lms.sclsandbox.xyz:8888"
```

---

## Documentation

- [SSO Implementation Guide](./SSO_IMPLEMENTATION_GUIDE.md)
- [Backend API Documentation](./NOTIFICATIONS_API_REFERENCE.md)
- [Moodle Documentation](https://docs.moodle.org/)
- [Backend Environment Configuration](./.env.production)

