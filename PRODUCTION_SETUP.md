# Production Server Setup Instructions

### Prerequisites

1. **Fresh Ubuntu 22.04 LTS Server**
   - Minimum: 2 CPU cores, 4GB RAM, 30GB disk
   - Root or sudo access required
   - Public IP address and domain configured

2. **Domain Configuration**
   - DNS records pointed to server IP:
     - `sclsandbox.xyz` → server IP
     - `lms.sclsandbox.xyz` → server IP

3. **SSL Certificates**
   - Self-signed or purchased certificate
   - Files: `cert.pem` and `key.pem`
   - Location: `nginx/ssl/`

### Setup Process

#### Step 1: SSH into the Server
```bash
ssh root@185.211.6.60
```

#### Step 2: Upload Setup Script
From your local machine:
```bash
scp setup-production-server.sh root@185.211.6.60:/tmp/
scp .env.production root@185.211.6.60:/opt/  # Optional, if not already there
```

#### Step 3: Prepare SSL Certificates
If you don't have SSL certificates yet, create self-signed ones:

On the server:
```bash
mkdir -p /opt/scl-institute/nginx/ssl

openssl req -x509 -newkey rsa:4096 -keyout /opt/scl-institute/nginx/ssl/key.pem \
  -out /opt/scl-institute/nginx/ssl/cert.pem -days 365 -nodes \
  -subj "/CN=sclsandbox.xyz"
```

#### Step 4: Run the Setup Script
```bash
chmod +x /tmp/setup-production-server.sh
sudo bash /tmp/setup-production-server.sh
```

**This script will:**
- ✅ Update system packages
- ✅ Install Docker and Docker Compose
- ✅ Install Git
- ✅ Clone the repository from GitHub
- ✅ Build and deploy all 6 Docker containers
- ✅ Start all services automatically

#### Step 5: Verify Services are Running
```bash
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml ps
```

Expected output:
```
scli-mysql-prod          mysql:8.0           Up (healthy)
scli-moodle-db-prod      bitnami/mariadb     Up (healthy)
scli-backend-prod        Node.js App         Up (unhealthy) *
scli-frontend-prod       React App           Up (unhealthy) *
scli-moodle-prod         Moodle 4.3          Up (starting)
scli-nginx-prod          nginx:alpine        Up (healthy)
```

*Note: Frontend/Backend may show "unhealthy" initially but will be healthy once NGINX routing is established.

### Services Overview

| Service | Container | Port | URL |
|---------|-----------|------|-----|
| Frontend | `scli-frontend-prod` | 3000 | https://sclsandbox.xyz |
| Backend API | `scli-backend-prod` | 4000 | https://sclsandbox.xyz/api |
| Moodle LMS | `scli-moodle-prod` | 8080 | https://lms.sclsandbox.xyz |
| NGINX Proxy | `scli-nginx-prod` | 80/443 | (routes all traffic) |
| MySQL | `scli-mysql-prod` | 3306 | (internal only) |
| MariaDB | `scli-moodle-db-prod` | 3306 | (internal only) |

### Important Files

```
/opt/scl-institute/
├── docker-compose.prod.yml      # All 6 containers
├── .env.production              # Environment variables (ensure this exists!)
├── nginx/
│   ├── nginx.conf               # Reverse proxy configuration
│   └── ssl/
│       ├── cert.pem             # SSL certificate
│       └── key.pem              # SSL private key
├── backend/                     # Node.js API server
├── frontend/                    # React application
└── moodle-scripts/             # Moodle SSO plugin
```

### Environment Variables (.env.production)

Make sure your `.env.production` file exists with proper values:

```bash
# Node/Build
NODE_ENV=production
VITE_ENV=production
VITE_API_URL=/api

# MySQL (for Backend)
DB_HOST=scli-mysql-prod
DB_PORT=3306
DB_USER=scluser
DB_PASS=SecurePassword123
DB_NAME=scl_db

# MariaDB (for Moodle)
MARIADB_ROOT_PASSWORD=MoodleRootPass
MARIADB_DATABASE=moodle_prod
MARIADB_USER=moodle_user
MARIADB_PASSWORD=MoodleUserPass
MARIADB_CHARACTER_SET=utf8mb4
MARIADB_COLLATE=utf8mb4_unicode_ci

# Moodle Configuration
MOODLE_USERNAME=admin
MOODLE_PASSWORD=AdminPass123
MOODLE_SITE_NAME=SCL Institute
MOODLE_URL=https://lms.sclsandbox.xyz

# SSO Configuration
SSO_SECRET=SCLInstitute_SSO_Secret_2026_ProdKey

# Server
PORT=4000
```

### Troubleshooting

#### Check Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f scli-moodle-prod
docker-compose -f docker-compose.prod.yml logs -f scli-backend-prod
```

#### Restart a Service
```bash
docker-compose -f docker-compose.prod.yml restart scli-moodle-prod
```

#### Restart All Services
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

#### Port 80/443 Already in Use
If NGINX fails to start, another service might be using ports 80/443:
```bash
sudo lsof -i :80
sudo lsof -i :443
# Kill the process using the port
sudo kill -9 <PID>
```

### Testing the Installation

1. **Frontend Access**
   - Visit: `https://sclsandbox.xyz`
   - Should load React application

2. **API Health Check**
   - `curl https://sclsandbox.xyz/api/health`
   - Response: `{"status":"OK","timestamp":"..."}`

3. **Moodle Setup**
   - Visit: `https://lms.sclsandbox.xyz`
   - Complete Moodle setup wizard
   - Database: `moodle_prod` (from .env.production)
   - User: admin (from MOODLE_USERNAME)

4. **SSO Token Generation**
   - Backend endpoint: `POST /api/sso/generate`
   - Returns: Token for Moodle authentication

### Production Notes

- **Backups**: Ensure `docker volumes` are backed up regularly
  ```bash
  docker volume ls | grep scl-institute
  ```

- **Logs**: Docker logs are stored in `/var/lib/docker/containers/`
  - Configure rotation in docker-compose if needed

- **Updates**: Pull latest code and rebuild
  ```bash
  cd /opt/scl-institute
  git pull origin main
  docker-compose -f docker-compose.prod.yml down
  docker-compose -f docker-compose.prod.yml build --no-cache
  docker-compose -f docker-compose.prod.yml up -d
  ```

- **Monitoring**: Check resource usage
  ```bash
  docker stats
  ```
