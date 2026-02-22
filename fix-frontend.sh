#!/bin/bash
# SCL-Institute Frontend Fix Script
# Run this on your production server (185.211.6.60)

echo "🔧 SCL-Institute Frontend Fix"
echo "============================="

# Navigate to project directory
cd /opt/scl-institute || { echo "❌ Project directory not found"; exit 1; }

echo "✅ In project directory: $(pwd)"

# Check current container status
echo "📊 Current container status:"
docker-compose -f docker-compose.prod.yml ps

# Check NGINX logs
echo "📋 NGINX logs (last 10 lines):"
docker logs scli-nginx-prod --tail 10

# Check frontend logs  
echo "📋 Frontend logs (last 10 lines):"
docker logs scli-frontend-prod --tail 10

# Test NGINX configuration
echo "🔍 Testing NGINX configuration:"
docker exec scli-nginx-prod nginx -t

# Restart NGINX container
echo "🔄 Restarting NGINX..."
docker-compose -f docker-compose.prod.yml restart scli-nginx-prod

# Wait for restart
echo "⏳ Waiting 10 seconds for NGINX to restart..."
sleep 10

# Test internal connection
echo "🧪 Testing internal frontend connection:"
docker exec scli-nginx-prod curl -I http://scli-frontend-prod:3000 || echo "❌ Internal connection failed"

# Restart frontend if needed
echo "🔄 Restarting frontend container..."
docker-compose -f docker-compose.prod.yml restart scli-frontend-prod

# Wait for frontend restart
echo "⏳ Waiting 15 seconds for frontend to restart..."
sleep 15

# Test endpoints
echo "🧪 Testing endpoints:"
echo "Frontend: $(curl -s -o /dev/null -w %{http_code} http://sclsandbox.xyz)"
echo "API: $(curl -s -o /dev/null -w %{http_code} http://sclsandbox.xyz/api/health)"
echo "LMS: $(curl -s -o /dev/null -w %{http_code} http://lms.sclsandbox.xyz)"

# If still not working, rebuild frontend
if [ "$(curl -s -o /dev/null -w %{http_code} http://sclsandbox.xyz)" != "200" ]; then
    echo "🏗️ Rebuilding frontend container..."
    docker-compose -f docker-compose.prod.yml up -d --build --no-deps scli-frontend-prod
    
    echo "⏳ Waiting 30 seconds for rebuild..."
    sleep 30
    
    echo "🧪 Final test:"
    curl -I http://sclsandbox.xyz
else
    echo "✅ Frontend is now working!"
    curl -I http://sclsandbox.xyz
fi

echo ""
echo "🎯 Final Status Check:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "✅ Fix completed! Try accessing http://sclsandbox.xyz"