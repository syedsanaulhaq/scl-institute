# Environment Setup Guide

This project supports two distinct environments: **Development** (local) and **Production** (server).

## Quick Summary

| Environment | Location | Branch | Compose File | Env File | Command |
|---|---|---|---|---|---|
| **Development** | Local machine | `develop` | `docker-compose.dev.yml` | `.env.development` | `docker-compose -f docker-compose.dev.yml up -d` |
| **Production** | Server 185.211.6.60 | `main` | `docker-compose.prod.yml` | `.env.production` or `.env` | `docker-compose -f docker-compose.prod.yml up -d` |

## Files Overview

```
.env.development          # Development environment variables (local)
.env.production           # Production environment variables (server)
docker-compose.dev.yml    # Development Docker Compose configuration
docker-compose.prod.yml   # Production Docker Compose configuration
docker-compose.yml        # Original file (do not use - for reference only)
```

## Development Environment (Local Machine)

**Location**: Your local machine
**Git Branch**: `develop` (or `main` for testing)
**Configuration File**: `.env.development`
**Start Command**: `docker-compose -f docker-compose.dev.yml up -d`

### Development Environment Variables

From `.env.development`:
```env
NODE_ENV=development
PORT=4000
DB_HOST=scli-mysql
DB_PORT=3306
DB_USER=scl_user
DB_PASS=scl_password
DB_NAME=scl_institute
VITE_API_URL=http://localhost/api
VITE_ENV=development
```

### Services & Ports (Local Development)

| Service | Container Port | Host Port | Access |
|---|---|---|---|
| MySQL | 3306 | 33061 | `localhost:33061` |
| Backend | 4000 | 4000 | `localhost:4000` |
| Frontend | - | 3000 | `localhost:3000` (Vite dev) |
| NGINX | 80 | 80 | `localhost` |
| Moodle | 8080 | 8080 | `localhost:8080` |

### Development Database

- **Database Name**: `scl_institute`
- **User**: `scl_user`
- **Password**: `scl_password`
- **Host**: `scli-mysql` (inside Docker) or `localhost:33061` (from host)

### Local Development Access

```
Frontend:     http://localhost
Backend API:  http://localhost/api  or  http://localhost:4000/api
Moodle LMS:   http://localhost:8080
Health Check: http://localhost/health
```

### Setup & Start Development Environment

1. **Start development containers**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Check services are running**:
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

3. **Access services**:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost/api`
   - Moodle LMS: `http://localhost:8080`

4. **Stop development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

5. **View logs**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f scli-backend
   docker-compose -f docker-compose.dev.yml logs -f scli-frontend
   ```

## Production Environment (Server)

**Location**: Server 185.211.6.60
**Git Branch**: `main`
**Configuration File**: `.env` (created from `.env.production`)
**Start Command**: `docker-compose -f docker-compose.prod.yml up -d`

### Production Environment Variables

From `.env.production` (or `.env` on server):
```env
NODE_ENV=production
PORT=4000
DB_HOST=scli-mysql
DB_PORT=3306
DB_USER=scl_user
DB_PASS=SecureDBPass2026!
DB_NAME=scl_institute_prod
VITE_API_URL=http://185.211.6.60/api
VITE_ENV=production
MOODLE_URL=http://moodle:8080
MOODLE_USERNAME=admin
MOODLE_PASSWORD=SCLInst!2026
```

### Services & Ports (Production)

| Service | Container Port | Exposed | Access |
|---|---|---|---|
| MySQL | 3306 | Internal only | Via container network |
| Backend | 4000 | Internal only | Via NGINX proxy |
| Frontend | - | Via NGINX | `sclsandbox.xyz` |
| NGINX | 80, 443 | Public | `sclsandbox.xyz`, `lms.sclsandbox.xyz` |
| Moodle | 8080 | Internal only | Via NGINX proxy |

### Production Database

- **Database Name**: `scl_institute_prod`
- **User**: `scl_user`
- **Password**: `SecureDBPass2026!`
- **Host**: `scli-mysql` (inside Docker) - not accessible from host machine

### Production Public Access

```
Frontend:     http://sclsandbox.xyz  or  https://sclsandbox.xyz
Backend API:  http://sclsandbox.xyz/api
Moodle LMS:   http://lms.sclsandbox.xyz
Health Check: http://sclsandbox.xyz/health
```

### Server Setup & Deployment

1. **SSH into server**:
   ```bash
   ssh root@185.211.6.60
   ```

2. **Navigate to project**:
   ```bash
   cd /opt/scl-institute
   ```

3. **Pull latest code**:
   ```bash
   git pull origin main
   ```

4. **Start production services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Check services**:
   ```bash
   docker ps  # List all containers
   docker-compose -f docker-compose.prod.yml ps  # Compose-aware view
   ```

6. **View logs**:
   ```bash
   docker logs scli-backend-prod
   docker logs scli-nginx-prod
   docker logs scli-frontend-prod
   ```

7. **Stop services**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

## Deployment Workflow

### From Local Development to Production

1. **Develop & Test Locally**
   ```bash
   git checkout develop
   docker-compose -f docker-compose.dev.yml up -d
   # Make changes, test locally
   ```

2. **Commit & Push to Develop**
   ```bash
   git add .
   git commit -m "feature: Add new feature"
   git push origin develop
   ```

3. **Create Pull Request to Main**
   ```bash
   # Via GitHub: Create PR from develop → main
   ```

4. **Merge to Main**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

5. **Deploy to Production Server**
   ```bash
   ssh root@185.211.6.60
   cd /opt/scl-institute
   git pull origin main
   docker-compose -f docker-compose.prod.yml up -d --build
   # Verify services: docker ps
   ```

6. **Verify Deployment**
   ```bash
   # Check frontend
   curl -I http://sclsandbox.xyz
   
   # Check API
   curl -X POST http://sclsandbox.xyz/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@scl.com","password":"password"}'
   
   # Check logs
   docker logs scli-backend-prod --tail 20
   ```

## Testing Credentials

Both environments use the same hardcoded test credentials (in backend code):

```
Email:    admin@scl.com
Password: password

OR

Email:    student@scl.com
Password: password
```

## Docker Networks

- **Development**: `scl-network-dev`
- **Production**: `scl-network-prod`

Services communicate using their container names on the same network.

## Environment Variables Overview

### Backend Services

| Variable | Dev | Prod | Purpose |
|---|---|---|---|
| `NODE_ENV` | development | production | Node.js environment mode |
| `PORT` | 4000 | 4000 | Backend server port |
| `DB_HOST` | scli-mysql | scli-mysql | Database hostname |
| `DB_PORT` | 3306 | 3306 | Database port |
| `DB_USER` | scl_user | scl_user | Database user |
| `DB_PASS` | scl_password | SecureDBPass2026! | Database password |
| `DB_NAME` | scl_institute | scl_institute_prod | Database name |

### Frontend Services

| Variable | Dev | Prod | Purpose |
|---|---|---|---|
| `VITE_API_URL` | http://localhost/api | http://185.211.6.60/api | Backend API base URL |
| `VITE_ENV` | development | production | Environment mode |

### Moodle Services

| Variable | Dev | Prod | Purpose |
|---|---|---|---|
| `MOODLE_USERNAME` | moodle | admin | Moodle admin username |
| `MOODLE_PASSWORD` | moodlepass | SCLInst!2026 | Moodle admin password |
| `MOODLE_URL` | http://localhost:8080 | http://moodle:8080 | Moodle internal URL |

## Important Notes

### 🔐 Security

⚠️ **WARNING**: Production passwords should be rotated regularly!
- Keep `.env.production` out of version control
- Use strong passwords in production
- Rotate `DB_PASS` and `MOODLE_PASSWORD` periodically

### 🐳 Docker Compose Versions

- Production Server: Docker Compose v5.0.2
  - Does NOT support root-level `env_file` directive
  - Solution: Create `.env` file in root (Docker auto-loads)
- Local: Use `-f` flag to explicitly specify compose file

### 🔗 Database Connections

**From Local Host**:
- Development: `localhost:33061` (user: scl_user, pass: scl_password)
- Production: Not accessible from host (internal only)

**From Inside Container**:
- Development: `scli-mysql:3306`
- Production: `scli-mysql:3306`

### 🌐 DNS & Domain Names

**Local Development**:
- Services communicate via container names
- No DNS needed (Docker internal)

**Production**:
- Domain: `sclsandbox.xyz`
- LMS Domain: `lms.sclsandbox.xyz`
- IP: `185.211.6.60`
- NGINX routes requests to backend services

## Troubleshooting

### Development Issues

**Containers not on same network**:
```bash
docker network inspect scl-network-dev
# Check if all containers listed
```

**Backend can't find database**:
```bash
docker logs scli-backend
# Check for "DB Init Failed" messages
```

**Frontend can't connect to API**:
```bash
docker exec scli-frontend env | grep VITE_API
# Verify VITE_API_URL
```

### Production Issues

**Backend unhealthy**:
```bash
ssh root@185.211.6.60
docker logs scli-backend-prod
docker exec scli-backend-prod env | grep DB_
```

**NGINX not routing to backend**:
```bash
docker logs scli-nginx-prod
docker exec scli-nginx-prod cat /etc/nginx/nginx.conf | grep proxy_pass
```

**Can't access domain**:
```bash
# Check DNS
nslookup sclsandbox.xyz
ping 185.211.6.60

# Check NGINX
curl -I http://185.211.6.60
```

## Related Documentation

- [README.md](./README.md) - Project overview
- [01_START_HERE_IMPLEMENTATION.md](./01_START_HERE_IMPLEMENTATION.md) - Implementation guide
- `.env.development` - Dev configuration
- `.env.production` - Prod configuration
- `docker-compose.dev.yml` - Dev orchestration
- `docker-compose.prod.yml` - Prod orchestration
**Configuration File**: `.env.production`

### Before Deploying to Production

⚠️ **CRITICAL**: Update all security-sensitive values in `.env.production`:

```env
# Change these values!
DB_PASS=change_this_secure_password
MARIADB_PASSWORD=change_this_secure_password
MARIADB_ROOT_PASSWORD=change_this_moodle_root_password
MYSQL_ROOT_PASSWORD=change_this_production_root_password
SSO_SECRET=change_this_to_production_secret_key
MOODLE_PASSWORD=change_this_production_password
```

### Setup Production Environment

1. **Copy production environment to your server**:
   ```bash
   # On production server
   scp -r /path/to/SCL-Institute user@server:/path/to/
   ```

2. **Update `.env.production` with secure values** (on server):
   ```bash
   nano .env.production
   # Update all passwords and secrets
   ```

3. **Start production containers**:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

4. **Access production services**:
   - Frontend: `https://sclsandbox.xyz`
   - Backend API: `https://api.sclsandbox.xyz/api`
   - Moodle LMS: `https://lms.sclsandbox.xyz`

5. **Monitor production logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

6. **Stop production environment**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

## Key Differences Between Environments

| Feature | Development | Production |
|---------|-------------|-----------|
| **Restart Policy** | None (manual control) | `always` (auto-restart) |
| **Logging** | Console output | JSON file with rotation |
| **API URL** | `http://localhost:4000/api` | `https://api.sclsandbox.xyz/api` |
| **Debug Mode** | Enabled | Disabled |
| **Hot Reload** | Yes (volumes mapped) | No |
| **Database Persistence** | Dev volumes | Production volumes |
| **SSL/TLS** | HTTP only | HTTPS enabled |

## Database Management

### Development
- SCL Institute DB: `scl_institute` (user: `scl_user`)
- Moodle DB: `bitnami_moodle` (user: `bn_moodle`)

### Production
- SCL Institute DB: `scl_institute_prod` (user: `scl_user`)
- Moodle DB: `bitnami_moodle_prod` (user: `bn_moodle`)

## Switching Between Environments

**From Development to Production**:
```bash
# Stop development
docker-compose -f docker-compose.dev.yml down

# Deploy to production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

**From Production to Development**:
```bash
# Stop production
docker-compose -f docker-compose.prod.yml down

# Start development
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d
```

## Environment Variables Reference

### Common Variables
- `NODE_ENV`: `development` or `production`
- `VITE_ENV`: Frontend environment (development or production)
- `VITE_API_URL`: Frontend API base URL
- `PORT`: Backend port

### Database Variables
- `DB_HOST`: MySQL host
- `DB_PORT`: MySQL port
- `DB_USER`: MySQL username
- `DB_PASS`: MySQL password
- `DB_NAME`: MySQL database name

### Moodle Variables
- `MOODLE_URL`: Moodle domain URL
- `MOODLE_USERNAME`: Admin username
- `MOODLE_PASSWORD`: Admin password
- `MOODLE_SITE_NAME`: Site display name

### Security Variables
- `SSO_SECRET`: Single Sign-On secret key (keep private!)

## Deployment Checklist for Production

- [ ] Copy project to production server
- [ ] Update all passwords in `.env.production`
- [ ] Configure SSL certificates in `nginx/ssl/`
- [ ] Update domain names in nginx configuration
- [ ] Run database migrations if needed
- [ ] Test all services are accessible
- [ ] Set up log rotation and monitoring
- [ ] Configure backups for databases
- [ ] Set up monitoring and alerts

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs
```

### Database connection fails
```bash
# Verify database container is healthy
docker-compose -f docker-compose.dev.yml ps
```

### Environment variables not loaded
```bash
# Manually set in terminal
$env:VAR_NAME='value'
```

## Support

For issues or questions, refer to the main [README.md](README.md) or project documentation.
