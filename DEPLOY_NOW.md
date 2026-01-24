# 🚀 Production Server Setup - Quick Reference

**Date**: January 24, 2026  
**Server**: 185.211.6.60  
**Status**: ✅ Ready for Deployment  

---

## 📋 What's Been Prepared

All files have been created and pushed to GitHub (`main` branch). Your production server is ready to deploy!

### Configuration Files
- ✅ `.env.production` - Production environment with correct domain setup
- ✅ `docker-compose.prod.yml` - Production container orchestration
- ✅ `nginx/nginx.conf` - NGINX reverse proxy configuration

### Deployment Scripts
- ✅ `scripts/deploy-server.sh` - Automated one-command setup for Linux
- ✅ `scripts/update-server.sh` - Update script for future deployments

### Documentation
- ✅ `PRODUCTION_DEPLOYMENT.md` - Complete 9-step deployment guide
- ✅ This file - Quick reference

---

## 🌐 Domain Configuration

| Component | Domain/URL | Purpose |
|-----------|-----------|---------|
| **Frontend** | http://sclsandbox.xyz | Main application |
| **LMS** | http://lms.sclsandbox.xyz | Moodle learning platform |
| **API (IP)** | http://185.211.6.60/api | Backend API via IP |
| **API (Domain)** | http://sclsandbox.xyz/api | Backend API via domain |

---

## 📱 Access Credentials

### SCL Institute Login
```
Email: admin@scl.com
Password: password
```

### Moodle Admin
```
Username: admin
Password: SCLInst!2026
```

### Database
```
MySQL Root: (from .env.production)
MySQL User: scl_user
Moodle DB: bitnami_moodle_prod
```

---

## ⚡ Quick Setup (One Command)

SSH into your server and run:

```bash
wget https://raw.githubusercontent.com/syedsanaulhaq/scl-institute/main/scripts/deploy-server.sh -O /tmp/deploy-server.sh && \
chmod +x /tmp/deploy-server.sh && \
sudo /tmp/deploy-server.sh
```

**That's it!** The script will:
1. Install Docker & Docker Compose
2. Clone the repository
3. Build all containers
4. Start all services
5. Verify everything is running

---

## 📝 Manual Setup Steps (If Needed)

If you prefer manual setup, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for:
1. Step-by-step instructions
2. Troubleshooting guide
3. Database backup procedures
4. SSL/HTTPS setup
5. Monitoring and maintenance

---

## 🔄 Update Process

When you merge code changes to `main` branch:

```bash
ssh root@185.211.6.60
cd /opt/scl-institute
bash ./scripts/update-server.sh
```

This will:
- Pull latest code from main
- Rebuild Docker images
- Restart services gracefully
- Verify all services are running

---

## ✅ Deployment Checklist

- [ ] SSH access to server verified
- [ ] Run deployment script OR follow manual steps
- [ ] Verify all containers are running: `docker ps`
- [ ] Update DNS records to point to 185.211.6.60
- [ ] Test frontend: http://sclsandbox.xyz
- [ ] Test LMS: http://lms.sclsandbox.xyz
- [ ] Test API: http://185.211.6.60/api
- [ ] Configure SSL certificates (optional but recommended)
- [ ] Setup monitoring and log rotation
- [ ] Schedule database backups

---

## 🔍 Verify Deployment

After running the deployment script:

```bash
# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.prod.yml logs

# Test API
curl http://localhost:4000/api

# Test frontend
curl http://localhost:3000
```

---

## 🛑 Common Commands

```bash
# Connect to server
ssh root@185.211.6.60

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Check container status
docker ps

# View resource usage
docker stats
```

---

## 🐛 Troubleshooting

If services don't start:

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Restart everything
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

For detailed troubleshooting, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md#-troubleshooting)

---

## 📚 Complete Documentation

- **Setup Guide**: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Git Workflow**: [GIT_WORKFLOW.md](GIT_WORKFLOW.md)
- **Quick Start (Dev)**: [QUICK_START.md](QUICK_START.md)
- **Environment Setup**: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
- **GitHub Repository**: https://github.com/syedsanaulhaq/scl-institute

---

## 🎯 Next Steps

1. **SSH to server**: `ssh root@185.211.6.60`
2. **Run setup script**: See "One Command Setup" above
3. **Wait 5-10 minutes** for all services to fully start
4. **Update DNS records** to point domains to 185.211.6.60
5. **Test services** once DNS propagates
6. **Setup SSL certificates** (optional but recommended)
7. **Configure monitoring** and backups

---

## ⚠️ Important Notes

1. **Passwords**: The `.env.production` file has secure default passwords. You may want to change them before deploying.
2. **DNS**: It may take 5-15 minutes for DNS changes to propagate globally.
3. **First Start**: Moodle may take 5-10 minutes to fully initialize on first start.
4. **Backups**: Setup automatic database backups from the start.
5. **Monitoring**: Monitor container logs and system resources regularly.

---

## 📞 Support

- Check [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) troubleshooting section
- Review container logs: `docker-compose logs`
- Check GitHub Issues: https://github.com/syedsanaulhaq/scl-institute/issues

---

**Everything is ready! Your production deployment is just one command away.** 🚀
