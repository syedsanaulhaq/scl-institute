# SSO Implementation Guide - Properly Organized

## Overview
This guide documents the properly organized SSO (Single Sign-On) implementation linking the Docker system to LAMP Moodle.

---

## 1. Frontend Code Organization

### Problem: Code Duplication
**Before:** The `handleAccessLMS` function was duplicated in 7 different files:
- `Dashboard.jsx`
- `StudentNotifications.jsx`
- `StudentMaterials.jsx`
- `StudentPortalDashboard.jsx`
- `StudentProgramme.jsx`
- `Sidebar.jsx`
- Student components

**Solution:** Centralized `ssoService.js` utility

### New Structure

```
frontend/src/
├── utils/
│   └── ssoService.js                ← Centralized SSO logic
├── pages/
│   ├── Dashboard.jsx                ← Uses ssoService
│   └── StudentNotifications.jsx      ← Uses ssoService
└── components/
    ├── Sidebar.jsx                  ← Uses ssoService
    └── student/
        ├── StudentMaterials.jsx      ← Uses ssoService
        ├── StudentPortalDashboard.jsx ← Uses ssoService
        └── StudentProgramme.jsx       ← Uses ssoService
```

### Centralized SSO Service (`ssoService.js`)

Two main exported functions:

#### 1. `generateSSOToken(email, redirectTo)`
- **Purpose**: Generate SSO token from backend
- **Input**: User email, optional redirect URL
- **Output**: `{success: boolean, redirectUrl?: string, error?: string}`
- **Usage**:
  ```javascript
  const result = await generateSSOToken('user@example.com');
  if (result.success) {
    window.open(result.redirectUrl, '_blank');
  }
  ```

#### 2. `openMoodleSSO(email, options)`
- **Purpose**: Complete SSO login flow in one call
- **Input**: Email + configuration options
- **Options**:
  - `newWindow` (bool): Open in new window (default: true)
  - `onError` (func): Error callback
  - `onSuccess` (func): Success callback
  - `redirectTo` (string): Custom redirect URL
- **Usage**:
  ```javascript
  await openMoodleSSO(user.email, {
    onError: (err) => setError(err),
    onSuccess: () => console.log('Opened Moodle')
  });
  ```

### Component Integration Pattern

```javascript
// Old duplicated code (❌ DON'T USE)
const handleAccessLMS = async () => {
  try {
    const response = await axios.post(`${API_URL}/sso/generate`, {
      email: user.email
    });
    if (response.data.success) {
      window.open(response.data.redirectUrl, '_blank');
    }
  } catch (err) {
    setError(err.message);
  }
};

// New centralized approach (✓ CORRECT)
import { openMoodleSSO } from '../utils/ssoService';

const handleAccessLMS = async () => {
  setLoading(true);
  await openMoodleSSO(user.email, {
    onError: setError,
    onSuccess: () => setLoading(false)
  });
  setLoading(false);
};
```

---

## 2. Backend SSO API

### Endpoints

#### A. Generate Token
```
POST /api/sso/generate
Content-Type: application/json

{
  "email": "user@sclsandbox.xyz",
  "redirect_to": "https://moodle.example.com/course"  // optional
}

Response (200 OK):
{
  "success": true,
  "redirectUrl": "http://lms.sclsandbox.xyz:8888/local/sclsso/login.php?token=uuid-token"
}

Response (400/500):
{
  "success": false,
  "message": "Error description"
}
```

**Implementation Location**: `backend/index.js` (lines 171-250)

**Flow**:
1. Validate email provided
2. Query users table for matching email
3. Generate UUID token
4. Insert token record into `sso_tokens` table
5. Return Moodle login URL with token

#### B. Verify Token
```
POST /api/sso/verify
Content-Type: application/json

{
  "token": "uuid-token",
  "secret": "supersecretkey"
}

Response (200 OK):
{
  "success": true,
  "user": {
    "email": "user@sclsandbox.xyz",
    "firstname": "John",
    "lastname": "Doe",
    "role": "Super Admin"
  }
}
```

**Implementation Location**: `backend/index.js` (lines 250+)

**Security**:
- Secret key validation
- Token expiration on usage (deleted after use)
- HTTPS required in production

### Environment Configuration

```bash
# Backend (.env.production)
SSO_SECRET=supersecretkey
MOODLE_URL=http://lms.sclsandbox.xyz:8888
MOODLE_DATABASE_HOST=127.0.0.1
MOODLE_DATABASE_USER=moodleuser
MOODLE_DATABASE_PASSWORD=moodlepass
MOODLE_DATABASE_NAME=moodle
```

---

## 3. Moodle SSO Plugin Structure

### Plugin Location
```
/var/www/moodle-prod/local/sclsso/
├── version.php        ← Plugin metadata
├── lang/
│   └── en/
│       └── local_sclsso.php  ← Language strings
├── login.php          ← SSO token handler
├── lib.php            ← Helper functions
└── db/
    └── install.xml    ← Database schema (if needed)
```

### Key Files

#### 1. `login.php` - SSO Token Handler
**Purpose**: Receives token, verifies with backend, creates/updates Moodle user

**Flow**:
```
Moodle Login URL with token
  ↓
Verify token via cURL to backend API
  ↓
Backend validates token
  ↓
Get user data from backend
  ↓
Check if user exists in Moodle
  ├─→ No: Create new user
  └─→ Yes: Update user info
  ↓
Assign roles based on SCL role mapping
  ├─→ Super Admin → Moodle Manager + Site Admin
  ├─→ Teacher → Moodle Teacher
  └─→ Student → Moodle Student
  ↓
Create Moodle session
  ↓
Log login event
  ↓
Redirect to dashboard/specified URL
```

#### 2. Role Mapping
```php
'Super Admin' → 'manager' (Moodle Manager + Site Admin)
'LMS Manager' → 'manager' (Moodle Manager)
'Teacher' → 'editingteacher' (Moodle Teacher)
'Student' → (Student role automatically)
'Admissions Officer' → 'manager'
'Faculty & HR Manager' → 'manager'
```

---

## 4. Data Flow: End-to-End

```
┌─ SCL Web Application ─────────────────────────────────────┐
│                                                            │
│  Dashboard.jsx                                            │
│  └─→ Click "Access Moodle" button                        │
│      └─→ Call handleAccessLMS()                          │
│          └─→ Import from ssoService.js                   │
│              └─→ openMoodleSSO(user.email)              │
│                  ├─→ axios.post('/api/sso/generate')   │
│                  │   └─→ Backend generates token       │
│                  └─→ window.open(redirectUrl)          │
│                                                            │
└────────────────────────────────────────────────────────────┘
                          ↓
        ┌─ Backend (Node.js + MySQL) ─────┐
        │                                   │
        │ /api/sso/generate endpoint      │
        │ ├─→ Query users table           │
        │ ├─→ Generate UUID token         │
        │ ├─→ Store in sso_tokens table  │
        │ └─→ Return Moodle login URL    │
        │                                   │
        │ /api/sso/verify endpoint        │
        │ ├─→ Validate secret             │
        │ ├─→ Look up token               │
        │ ├─→ Return user data            │
        │ └─→ Delete token (one-time use) │
        │                                   │
        └───────────────────────────────────┘
                          ↓
        ┌─ Moodle LAMP Installation ──────┐
        │                                   │
        │ local/sclsso/login.php          │
        │ ├─→ Receive token in URL        │
        │ ├─→ Verify with backend API    │
        │ ├─→ Get user data from backend  │
        │ ├─→ Check/create Moodle user   │
        │ ├─→ Assign roles               │
        │ ├─→ Create session             │
        │ └─→ Redirect to dashboard      │
        │                                   │
        └───────────────────────────────────┘
                          ↓
        ┌─ Moodle Dashboard ──────────────┐
        │                                   │
        │ User logged in and authenticated │
        │ Can access courses and materials │
        │                                   │
        └───────────────────────────────────┘
```

---

## 5. Database Schema

### SCL System (Docker MySQL)
```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50),  -- 'Super Admin', 'Teacher', 'Student', etc.
  ...
);

-- SSO Tokens (one-time use)
CREATE TABLE sso_tokens (
  token VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255),
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  role VARCHAR(50),
  redirect_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Moodle Database (System MariaDB)
```sql
-- Standard Moodle tables (auto-created during install)
CREATE TABLE mdl_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  username VARCHAR(100) UNIQUE,
  ...
);

CREATE TABLE mdl_role_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  roleid BIGINT,
  userid BIGINT,
  contextid BIGINT,
  ...
);
```

---

## 6. Environment Variables (Docker)

### Backend (`docker-compose.prod.yml`)
```yaml
backend:
  environment:
    SSO_SECRET: supersecretkey
    MOODLE_URL: http://lms.sclsandbox.xyz:8888
    MOODLE_DATABASE_HOST: 127.0.0.1
    MOODLE_DATABASE_PORT: 3306
    MOODLE_DATABASE_USER: moodleuser
    MOODLE_DATABASE_PASSWORD: moodlepass
    MOODLE_DATABASE_NAME: moodle
```

### Moodle (Apache Environment)
```bash
# /etc/environment or Apache .htaccess
export SCL_BACKEND_HOST=localhost
export SCL_BACKEND_PORT=4000
export SSO_SECRET=supersecretkey
```

---

## 7. Testing the SSO Flow

### Manual Test Steps

#### 1. Generate Token (from Browser Console)
```javascript
const response = await fetch('http://localhost:4000/api/sso/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@sclsandbox.xyz' })
});
const data = await response.json();
console.log(data.redirectUrl);
```

#### 2. Access Token URL
```
Open in browser:
http://lms.sclsandbox.xyz:8888/local/sclsso/login.php?token=YOUR-TOKEN-HERE
```

#### 3. Expected Result
- Token verified with backend
- User created/updated in Moodle
- Roles assigned correctly
- Redirected to Moodle dashboard
- User logged in automatically

---

## 8. Troubleshooting

### Issue: "Invalid or missing token"
**Cause**: Token not provided in URL
**Solution**: Ensure `?token=xxx` is in URL

### Issue: "SSO verification failed"
**Cause**: Backend unreachable or secret mismatch
**FIX**:
```bash
# Check backend connectivity
curl http://localhost:4000/api/health

# Verify SSO_SECRET in backend
grep SSO_SECRET .env.production
```

### Issue: User not found in Moodle
**Cause**: Email mismatch in databases
**Debug**:
```sql
-- Check SCL user
SELECT id, email, first_name, last_name, role FROM users WHERE email = 'user@sclsandbox.xyz';

-- Check Moodle user
SELECT id, email, firstname, lastname FROM mdl_user WHERE email = 'user@sclsandbox.xyz';
```

### Issue: Roles not assigned in Moodle
**Cause**: Role mapping issue
**Check**:
```bash
# In Moodle admin panel
Administration > Users > Permissions > User policies
Check user role assignments
```

---

## 9. Security Best Practices

1. **Secret Key Management**
   - Change `SSO_SECRET` from default in production
   - Store in `.env.production`, not in code
   - Rotate periodically

2. **Token Expiration**
   - Tokens are deleted after one use (✓ Implemented)
   - No token reuse possible
   - Consider adding time-based expiration

3. **HTTPS Enforcement**
   - Use HTTPS for all SSO endpoints in production
   - Set `MOODLE_URL` to HTTPS
   - Update Nginx SSL config

4. **CORS Protection**
   - Backend validates secret key
   - Frontend doesn't store sensitive tokens
   - Only valid redirects to Moodle are allowed

---

## 10. Deployment Checklist

- [ ] Backend SSO endpoints configured
- [ ] SSO_SECRET set in production environment
- [ ] Moodle LAMP installation verified
- [ ] SSO plugin files copied to /var/www/moodle-prod/local/sclsso/
- [ ] Moodle config.php has environment variable support
- [ ] Frontend uses centralized ssoService.js
- [ ] All components import openMoodleSSO instead of duplicating code
- [ ] Database connections tested
- [ ] Backend can reach Moodle via HTTP
- [ ] Moodle can reach Backend API for SSO verification
- [ ] Test login flow end-to-end
- [ ] Verify roles are assigned correctly
- [ ] Check Apache/Nginx logs for errors
- [ ] Verify HTTPS is working (in production)

---

## 11. Refactoring Completed Components

### ✓ Dashboard.jsx
- Removed: `axios` import
- Removed: `API_URL` const
- Added: `import { openMoodleSSO } from '../utils/ssoService'`
- Updated: `handleAccessLMS` to use service

### ⏳ Remaining Components (to refactor)
- StudentNotifications.jsx
- StudentMaterials.jsx
- StudentPortalDashboard.jsx
- StudentProgramme.jsx
- Sidebar.jsx

---

## 12. Related Files

```
Frontend SSO Service:
├── frontend/src/utils/ssoService.js         (✓ Created)
├── frontend/src/pages/Dashboard.jsx          (✓ Refactored)
└── frontend/src/pages/StudentNotifications.jsx (need update)

Backend SSO:
├── backend/index.js                         (SSO endpoints)
└── backend/routes/students.js               (Moodle enrollment)

Moodle Plugin:
├── /var/www/moodle-prod/local/sclsso/login.php
├── /var/www/moodle-prod/local/sclsso/lib.php
└── /var/www/moodle-prod/local/sclsso/version.php

Configuration:
├── docker-compose.prod.yml                  (Backend env vars)
├── .env.production                          (SSO settings)
└── /var/www/moodle-prod/config.php          (Moodle config)
```

---

## References

- [Moodle Plugin Development](https://docs.moodle.org/dev/Plugin_types)
- [Moodle Authentication](https://docs.moodle.org/dev/Auth_plugins)
- [SSO Patterns](https://en.wikipedia.org/wiki/Single_sign-on)

