# SCL Institute System Screenshots

This directory contains screenshot images showcasing the live SCL Institute platform interfaces.

## Screenshots to Add

### 1. Login Screen
- **File**: `01-login-screen.png`
- **URL**: http://sclsandbox.xyz
- **Description**: Primary authentication portal showing the login form
- **Resolution**: Recommended 1920x1080 or higher

### 2. Main Dashboard
- **File**: `02-admin-dashboard.png`
- **URL**: http://sclsandbox.xyz/dashboard
- **Description**: Institutional management dashboard showing all 6 operational modules
- **Resolution**: Recommended 1920x1080 or higher

### 3. Moodle LMS
- **File**: `03-moodle-lms.png`
- **URL**: http://lms.sclsandbox.xyz
- **Description**: Moodle LMS dashboard with course calendar and navigation
- **Resolution**: Recommended 1920x1080 or higher

## How to Add Screenshots

1. **Capture the images** from the live system:
   - Login screen from http://sclsandbox.xyz
   - Admin dashboard after login
   - Moodle LMS from http://lms.sclsandbox.xyz

2. **Save as PNG files** with names:
   - `01-login-screen.png`
   - `02-admin-dashboard.png`
   - `03-moodle-lms.png

3. **Place in this directory** (e:\SCL-Projects\SCL-Institute\screenshots\)

4. **Update system_showcase.html** to reference the actual images:
   ```html
   <img src="screenshots/01-login-screen.png" alt="Login Screen" class="screenshot-img">
   <img src="screenshots/02-admin-dashboard.png" alt="Admin Dashboard" class="screenshot-img">
   <img src="screenshots/03-moodle-lms.png" alt="Moodle LMS" class="screenshot-img">
   ```

## File Organization

```
screenshots/
├── README.md (this file)
├── 01-login-screen.png
├── 02-admin-dashboard.png
└── 03-moodle-lms.png
```

## Viewing the Showcase

Once images are added, view the system showcase at:
- **File**: `system_showcase.html`
- **Open in browser**: Right-click → Open with → Browser

The showcase page will display:
- Screenshot galleries
- System architecture details
- Module breakdown
- Development timeline
- Live system access information
