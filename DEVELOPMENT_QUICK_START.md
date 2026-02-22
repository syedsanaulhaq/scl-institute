# SCL Institute Development Environment - Quick Access Guide

## Current Status
- ✅ Frontend: Running on http://localhost:3000
- ✅ Backend API: Running on http://localhost:4000
- ✅ MySQL Database: Running (healthy)
- ⏹️ Moodle: Stopped (database initialization issues)
- ⏹️ Public Portal: Running on http://localhost:7777

## Quick Links

### Frontend (React/Vite)
- **URL**: http://localhost:3000
- **Purpose**: Admin dashboard and user interface
- **Status**: Running

### Backend API
- **Base URL**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health
- **DB Health**: http://localhost:4000/api/health/db
- **Status**: Running

### Moodle LMS
- **URL**: http://localhost:9090 (when running)
- **Status**: Currently stopped
- **Credentials**: 
  - Username: admin
  - Password: SCLInst!2026

### Database
- **Host**: localhost:33061
- **User**: scl_user
- **Password**: scl_password
- **Database**: scl_institute
- **Admin**: root / rootpassword

## Common Commands

### Start All Services
```powershell
cd "c:\SCL System\scl-institute"
docker-compose -f docker-compose.dev.yml up -d
```

### Stop All Services
```powershell
docker-compose -f docker-compose.dev.yml down
```

### Restart Specific Service
```powershell
docker restart scli-backend-dev
docker restart scli-frontend-dev
docker restart scli-mysql-dev
```

### View Logs
```powershell
# Backend logs
docker logs scli-backend-dev -f

# Frontend logs
docker logs scli-frontend-dev -f

# MySQL logs
docker logs scli-mysql-dev -f
```

### Access Database
```powershell
docker exec -it scli-mysql-dev mysql -u scl_user -pscl_password scl_institute
```

## Testing SSO Endpoints

### Generate SSO Token
```powershell
$json = @{email="admin@sclsandbox.xyz"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:4000/api/sso/generate" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $json `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Verify SSO Token
```powershell
$json = @{token="YOUR-TOKEN-HERE"; secret="dev-supersecretkey-changeinproduction"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:4000/api/sso/verify" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $json `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

## Database Queries

### View All Users
```sql
SELECT id, email, first_name, last_name, role FROM users;
```

### View SSO Tokens
```sql
SELECT token, email, firstname, lastname, created_at FROM sso_tokens;
```

### Clear Old SSO Tokens
```sql
DELETE FROM sso_tokens WHERE created_at < NOW() - INTERVAL 1 HOUR;
```

### Add Test User
```sql
INSERT INTO users (email, first_name, last_name, role)
VALUES ('testuser@sclsandbox.com', 'Test', 'User', 'student');
```

## Troubleshooting

### Backend Connection Errors
1. Check MySQL is running: `docker ps | grep scli-mysql`
2. Check health: http://localhost:4000/api/health/db
3. Verify credentials in `.env` file match MySQL container settings
4. Restart backend: `docker restart scli-backend-dev`

### Frontend API Errors
1. Ensure `VITE_API_URL=http://localhost:4000/api` in `.env`
2. Check backend is responding: http://localhost:4000/api/health
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check browser console for CORS errors

### Moodle Won't Start
1. Check database initialization: `docker logs scli-moodle-dev`
2. Ensure MariaDB container is healthy: `docker ps | grep scli-moodle-db`
3. For now, keep Moodle stopped: `docker stop scli-moodle-dev`
4. Focus on SSO backend/frontend testing

### Database Connection Refused
1. Check MySQL health: `docker exec scli-mysql-dev mysqladmin ping`
2. Verify all environment variables are set
3. Make sure port 33061 is available on host
4. Restart MySQL: `docker restart scli-mysql-dev`

## Environment Variables

Located in: `c:\SCL System\scl-institute\.env`

**Key Variables**:
```
# Backend
NODE_ENV=development
PORT=4000
DB_HOST=scli-mysql
DB_PORT=3306
DB_USER=scl_user
DB_PASS=scl_password
DB_NAME=scl_institute

# Frontend
VITE_API_URL=http://localhost:4000/api

# Security
SSO_SECRET=dev-supersecretkey-changeinproduction

# Moodle
MOODLE_URL=http://localhost:9090
```

## File Locations

- **Backend**: `c:\SCL System\scl-institute\backend\`
- **Frontend**: `c:\SCL System\scl-institute\frontend\`
- **Docker Compose**: `c:\SCL System\scl-institute\docker-compose.dev.yml`
- **Environment**: `c:\SCL System\scl-institute\.env`
- **Moodle Scripts**: `c:\SCL System\scl-institute\moodle-scripts\`

## Next Steps

1. **Fix Moodle**: Restore or rebuild Moodle container
2. **Deploy SSO**: Copy sso.php to Moodle root directory
3. **Test Flow**: Frontend → Backend → Moodle auto-login
4. **Configure**: Update production settings for real servers

## Support Commands

### Get All Container Status
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "scli-"
```

### Clean Docker System
```powershell
docker system prune -f
```

### Rebuild Specific Service
```powershell
docker-compose -f docker-compose.dev.yml up -d --build scli-backend-dev
```

### Monitor Resource Usage
```powershell
docker stats
```

---
Last Updated: 2026-02-22
SSO Status: ✅ Backend Functional | ⏳ Moodle Disabled | ❌ End-to-End Testing Pending
