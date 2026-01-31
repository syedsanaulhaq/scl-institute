# 🚀 SCL-Institute - Complete Learning Management System

**Project Status:** ✅ **PRODUCTION READY** with Automated Startup
**Date:** January 31, 2026

---

## 🎯 **QUICK START - ONE COMMAND**

```bash
# Start entire SCL Institute system (Frontend + Backend + Moodle + Databases + SSO)
.\start-scl.bat

# Stop system  
docker compose -f docker-compose.dev.yml down
```

**That's it!** The automated startup script handles everything:
- ✅ Stops existing containers
- ✅ Starts all services
- ✅ Installs SSO plugin automatically  
- ✅ Shows ready status with URLs

---

## 🌐 **Access URLs** (Available after startup)

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main SCL Institute interface |
| **Moodle LMS** | http://localhost:9090 | Learning management system |  
| **Backend API** | http://localhost:4000 | REST API server |

---

## 👥 **Test Users** (Real Identities + Proper Roles)

| Email | Password | Identity | Moodle Role |
|-------|----------|----------|-------------|
| admin@scl.com | password | Sarah Johnson | Manager (Full Access) |
| student@scl.com | password | John Doe | Student (Learning Access) |
| faculty@scl.com | password | Dr. Emily Chen | Teacher (Course Management) |
| hr@scl.com | password | Michael Rodriguez | Manager (Admin Access) |

---

## 🔐 **SSO Features**

- ✅ **Seamless Login**: Click "Learning Management (Moodle)" → Automatically logged in
- ✅ **Real User Names**: Shows actual names (Sarah Johnson, John Doe, etc.)
- ✅ **Role Mapping**: SCL roles → Moodle roles (admin→Manager, faculty→Teacher, student→Student)
- ✅ **Persistent**: Never disappears on restart (auto-installed every startup)

---

## 🏗️ Architecture Design

### Technology Stack
*   **Frontend:** React 18 + Vite + Tailwind CSS (Preserving "SCL Purple" Aesthetic).
*   **Backend:** Node.js + Express (Authentication & User Management).
*   **Database:** MySQL 8.0 (Users, Tokens, App Data).
*   **LMS:** Moodle 4.x (Fresh Docker Install).
*   **Containerization:** Docker Compose (Orchestrating all 4 services).

### 2. User Flow
1.  **User Visits:** `https://scl-institute.com` (Frontend)
2.  **Action:** LOGS IN via SCL-Institute Login Page.
3.  **System:** Authenticates user via Node.js Backend.
4.  **Landing:** User lands on **SCL-Institute Dashboard**.
    *   *Visual:* Grid of Cards (e.g., "LMS", "Profile", "Settings").
5.  **Action:** User clicks "LMS" Card.
6.  **System:**
    *   Frontend requests SSO Token from Backend.
    *   Backend talks to Moodle (Fresh Instance).
    *   Moodle validates and logs user in.
    *   User is redirected to Moodle Dashboard without 2nd login.

---

## 📋 System Requirements (From Scratch)

### A. Environment
*   **Hypervisor:** Docker Desktop (Windows).
*   **Services:**
    1.  `scli-frontend` (React)
    2.  `scli-backend` (Node API)
    3.  `scli-mysql` (Database)
    4.  `scli-moodle` (LMS - Fresh Install)
    5.  `scli-phpmyadmin` (DB Management)

### B. Functional Requirements
1.  **Login Module:**
    *   Secure Email/Password auth.
    *   "Remember Me" functionality.
    *   Visual: Glassmorphism, Premium SCL Aesthetic.
2.  **Dashboard Module:**
    *   Responsive Card Grid.
    *   Dynamic greeting ("Welcome back, Syed").
3.  **LMS Card:**
    *   Direct deep-link to Moodle.
    *   Auto-provisioning: If user exists in SCLI but not Moodle, create them in Moodle on fly (or pre-sync).

---

## 🛠️ Step-by-Step Implementation Plan

### Phase 1: The Clean Foundation
*   [ ] **Step 1: Project Initialization**
    *   Create new directory structure `SCL-Institute/`.
    *   Initialize git repository.
*   [ ] **Step 2: Docker Infrastructure**
    *   Create `docker-compose.yml` defining MySQL, Node, and **Moodle**.
    *   Ensure networks can talk to each other (Backend <-> Moodle).
*   [ ] **Step 3: Backend Core**
    *   Setup Express server.
    *   Implement `User` model (MySQL).
    *   Implement `auth/login` endpoint.

### Phase 2: Frontend & Aesthetics
*   [ ] **Step 4: React Setup**
    *   Initialize Vite project.
    *   Install Tailwind CSS and configure "SCL Purple" theme.
*   [ ] **Step 5: Login UI**
    *   Build the "Premium" Login Page (animations, glass effect).
*   [ ] **Step 6: Dashboard UI**
    *   Build the Card Layout.
    *   Create "LMS" Card.

### Phase 3: The Integration
*   [ ] **Step 7: Moodle Setup**
    *   Launch Moodle container.
    *   Run initial install wizard (admin/admin).
    *   Enable Web Services & REST Protocol.
*   [ ] **Step 8: The Bridge**
    *   Implement SSO Script in Backend.
    *   Connect "LMS Card" click to SSO Launch.
    *   Verify seamless transition.

---

## 📝 Success Criteria
*   [ ] User can login to SCL-Institute.
*   [ ] User sees a Dashboard with an LMS Card.
*   [ ] User clicks LMS Card -> Lands on Moodle Dashboard logged in.
*   [ ] **NO** legacy data/code usage.
*   [ ] **NO** messy manual installs (Everything containerized).

---

## 🌿 Git Branching Strategy

This project follows a structured Git workflow:

- **`main` branch**: Production-ready code deployed to your server
- **`develop` branch**: Your default development branch for local work

For detailed information on how to work with branches, features, and deployments, see [GIT_WORKFLOW.md](GIT_WORKFLOW.md).

---

## 🚀 Quick Setup Commands

### Development (Your Laptop)
```bash
./scripts/start-dev.bat    # Windows: Start local development
./scripts/start-dev.sh     # Linux/Mac: Start local development
```

### Stop All Services
```bash
./scripts/stop-all.bat     # Windows
./scripts/stop-all.sh      # Linux/Mac
```

For complete setup guide, see [QUICK_START.md](QUICK_START.md) and [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

## 🌐 Production Deployment

For deploying to a production server, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md).

**Quick Summary:**
1. Fresh Ubuntu 22.04 LTS server
2. Run `setup-production-server.sh` as root
3. All 6 Docker containers deployed automatically
4. Fully configured HTTPS and SSL
5. Ready for use

---

*This document serves as the Request for Comments (RFC) and Implementation Guide for the SCL-Institute Rebuild.*
