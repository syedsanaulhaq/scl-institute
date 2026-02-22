#!/bin/bash
# Multi-Domain Architecture Deployment Script
# Deploy the new 3-domain setup to production server

echo "🚀 SCL-Institute Multi-Domain Architecture Deployment"
echo "====================================================="
echo ""
echo "New Domain Structure:"
echo "• sclsandbox.xyz          → Public Portal (marketing/applications)"
echo "• system.sclsandbox.xyz   → SCL System (admin/student dashboards)"  
echo "• lms.sclsandbox.xyz      → Moodle LMS"
echo ""

cd /opt/scl-institute

echo "📥 Pulling latest changes..."
git pull origin main

echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

echo "🏗️ Building all services (including new public portal)..."  
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to initialize (45 seconds)..."
sleep 45

echo ""
echo "📊 Service Status Check:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🧪 Testing All Domains:"
echo "----------------------------------------"

echo -n "Public Portal (sclsandbox.xyz): "
PORTAL_STATUS=$(curl -s -o /dev/null -w %{http_code} http://sclsandbox.xyz)
echo "$PORTAL_STATUS"

echo -n "System Dashboard (system.sclsandbox.xyz): "  
SYSTEM_STATUS=$(curl -s -o /dev/null -w %{http_code} http://system.sclsandbox.xyz)
echo "$SYSTEM_STATUS"

echo -n "Moodle LMS (lms.sclsandbox.xyz): "
LMS_STATUS=$(curl -s -o /dev/null -w %{http_code} http://lms.sclsandbox.xyz)  
echo "$LMS_STATUS"

echo -n "API Health (system.sclsandbox.xyz/api): "
API_STATUS=$(curl -s -o /dev/null -w %{http_code} http://system.sclsandbox.xyz/api/health)
echo "$API_STATUS"

echo ""
echo "🎯 Deployment Summary:"
echo "----------------------------------------"

if [ "$PORTAL_STATUS" = "200" ]; then
    echo "✅ Public Portal: WORKING"
else  
    echo "❌ Public Portal: FAILED ($PORTAL_STATUS)"
fi

if [ "$SYSTEM_STATUS" = "200" ]; then
    echo "✅ System Dashboard: WORKING"
else
    echo "❌ System Dashboard: FAILED ($SYSTEM_STATUS)"  
fi

if [ "$LMS_STATUS" = "200" ]; then
    echo "✅ Moodle LMS: WORKING"
else
    echo "❌ Moodle LMS: FAILED ($LMS_STATUS)"
fi

if [ "$API_STATUS" = "200" ]; then
    echo "✅ Backend API: WORKING"  
else
    echo "❌ Backend API: FAILED ($API_STATUS)"
fi

echo ""
echo "🌐 Access Your System:"
echo "----------------------------------------"  
echo "📍 Public Portal:     http://sclsandbox.xyz"
echo "📍 Admin Dashboard:   http://system.sclsandbox.xyz"
echo "📍 Student Portal:    http://system.sclsandbox.xyz (after login)"
echo "📍 Moodle LMS:        http://lms.sclsandbox.xyz"
echo "📍 API Documentation: http://system.sclsandbox.xyz/api"
echo ""

# Check if all services are working
if [ "$PORTAL_STATUS" = "200" ] && [ "$SYSTEM_STATUS" = "200" ] && [ "$LMS_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
    echo "🎉 SUCCESS! All services are working perfectly!"
    echo ""
    echo "Your SCL-Institute system is now running with:"
    echo "• 4 Docker containers (Frontend System + Public Portal + Backend + NGINX)"  
    echo "• 2 Database containers (MySQL + MariaDB)"
    echo "• 1 Moodle LMS container" 
    echo "• Complete 3-domain architecture setup"
else
    echo "⚠️  Some services need attention. Check logs:"
    echo "docker-compose -f docker-compose.prod.yml logs -f"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Update DNS A records to point subdomains to this server"
echo "2. Setup SSL certificates for HTTPS (recommended)"  
echo "3. Test student application flow on public portal"
echo "4. Access admin dashboard and configure system"
echo ""