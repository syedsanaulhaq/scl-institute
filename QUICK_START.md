# Quick Start Guide - Development vs Production

## 🚀 Quick Start

### Development (Local Machine) - 2 Steps

1. **Start development environment**:
   ```bash
   ./scripts/start-dev.bat    # Windows
   ./scripts/start-dev.sh     # Linux/Mac
   ```

2. **Access services**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Moodle: http://localhost:8080

**Stop with**: `./scripts/stop-all.bat` (Windows) or `./scripts/stop-all.sh` (Linux/Mac)

---

## 📋 Environment Overview

### Development Environment
- **Location**: Your local machine
- **Config File**: `.env.development`
- **Docker Compose**: `docker-compose.dev.yml`
- **Purpose**: Development and testing
- **Features**:
  - Hot reload enabled
  - Console logging
  - Database volumes (local)

### Production Environment
- **Location**: Production server
- **Config File**: `.env.production`
- **Docker Compose**: `docker-compose.prod.yml`
- **Purpose**: Live deployment
- **Features**:
  - Auto-restart on failure
  - File-based logging with rotation
  - Optimized performance
  - SSL/TLS support

---

## 🔧 Manual Environment Commands

### Start Development
```bash
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d
```

### Stop Development
```bash
docker-compose -f docker-compose.dev.yml down
```

### View Development Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Start Production (on server)
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### View Production Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🔐 Security for Production

**Before deploying to production, update these in `.env.production`:**

```env
# Database passwords
DB_PASS=your_secure_password_here
MYSQL_PASSWORD=your_secure_password_here
MYSQL_ROOT_PASSWORD=your_secure_root_password

# Moodle passwords
MARIADB_PASSWORD=your_secure_password_here
MARIADB_ROOT_PASSWORD=your_secure_root_password
MOODLE_PASSWORD=your_production_admin_password

# SSL secret
SSO_SECRET=your_production_secret_key_here
```

---

## 📁 File Structure

```
.env.development              # Development configuration (local)
.env.production               # Production configuration (server)
docker-compose.dev.yml        # Development containers setup
docker-compose.prod.yml       # Production containers setup
scripts/
  └─ start-dev.bat            # Quick start development (Windows)
  └─ start-dev.sh             # Quick start development (Linux/Mac)
  └─ start-prod.bat           # Quick start production (Windows)
  └─ stop-all.bat             # Stop all environments (Windows)
  └─ stop-all.sh              # Stop all environments (Linux/Mac)
ENVIRONMENT_SETUP.md          # Detailed environment documentation
```

---

## 🌐 Service URLs

### Development
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Moodle LMS | http://localhost:8080 |
| MySQL | localhost:33061 |

### Production
| Service | URL |
|---------|-----|
| Frontend | https://sclsandbox.xyz |
| Backend API | https://api.sclsandbox.xyz |
| Moodle LMS | https://lms.sclsandbox.xyz |

---

## 🔄 Switching Environments

**From Dev to Production**:
1. Stop development: `./scripts/stop-all.bat`
2. On production server, update `.env.production` with real credentials
3. Start production: `./scripts/start-prod.bat`

**From Production back to Dev**:
1. Stop production (on server): `docker-compose -f docker-compose.prod.yml down`
2. Start development (local): `./scripts/start-dev.bat`

---

## 📊 Environment Variables

All variables are configured in `.env.development` and `.env.production`:

**Common Variables**:
- `NODE_ENV`: Environment type
- `PORT`: Backend port (4000)
- `VITE_API_URL`: Frontend API endpoint
- `VITE_ENV`: Frontend environment

**Database Variables**:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`

**Moodle Variables**:
- `MOODLE_URL`: LMS domain
- `MOODLE_USERNAME`: Admin username
- `MOODLE_PASSWORD`: Admin password

**Security Variables**:
- `SSO_SECRET`: Single Sign-On secret (keep private!)

---

## ✅ Deployment Checklist

- [ ] All `.env.production` passwords updated
- [ ] SSL certificates configured (if using HTTPS)
- [ ] Database backups scheduled
- [ ] Monitoring/alerts configured
- [ ] Production log rotation enabled
- [ ] All services responding on production URLs
- [ ] Database connections verified

---

## 🐛 Troubleshooting

**Container won't start?**
```bash
docker-compose -f docker-compose.dev.yml logs
```

**Database connection error?**
```bash
docker-compose -f docker-compose.dev.yml ps
```

**Port already in use?**
```bash
# Change ports in docker-compose.dev.yml or stop other services
```

---

## 📖 Full Documentation

See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for complete details on:
- Detailed setup instructions
- Database management
- Troubleshooting
- Security best practices
- Monitoring and logging

