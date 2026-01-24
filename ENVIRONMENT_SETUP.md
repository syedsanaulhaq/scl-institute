# Environment Setup Guide

This project supports two distinct environments: **Development** (local) and **Production** (server).

## Environment Structure

```
.env.development          # Development environment variables (local)
.env.production           # Production environment variables (server)
docker-compose.dev.yml    # Development Docker Compose configuration
docker-compose.prod.yml   # Production Docker Compose configuration
docker-compose.yml        # Original file (deprecated - use dev/prod variants)
```

## Development Environment (Local)

**Location**: Your local machine
**Configuration File**: `.env.development`

### Setup Development Environment

1. **Load development environment variables**:
   ```bash
   # On Windows (PowerShell)
   $env:NODE_ENV='development'
   Get-Content .env.development | ForEach-Object {
       if ($_ -match '^\s*([^=]+)=(.*)$') {
           [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
       }
   }
   ```

2. **Start development containers**:
   ```bash
   docker-compose -f docker-compose.dev.yml --env-file .env.development up -d
   ```

3. **Access development services**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000/api`
   - Moodle LMS: `http://localhost:8080`
   - MySQL: `localhost:33061`

4. **Stop development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Production Environment (Server)

**Location**: Your production server
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
