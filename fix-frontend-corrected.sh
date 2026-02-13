#!/bin/bash
# SCL-Institute Frontend Fix Script - CORRECTED VERSION
# Run this on your production server (185.211.6.60)

echo "🔧 SCL-Institute Frontend Fix (Corrected)"
echo "========================================="

cd /opt/scl-institute

echo "📊 All containers are healthy, checking NGINX proxy..."

# Test internal frontend connection
echo "🧪 Testing internal frontend connection:"
docker exec scli-nginx-prod curl -s -I http://scli-frontend:3000 | head -1

# Check NGINX proxy configuration
echo "📋 Checking NGINX configuration..."
docker exec scli-nginx-prod cat /etc/nginx/nginx.conf | grep -A 5 -B 5 "scli-frontend"

# The issue seems to be with NGINX proxy configuration
# Let's restart with proper service names
echo "🔄 Restarting NGINX with correct service names..."
docker-compose -f docker-compose.prod.yml restart scli-nginx

echo "⏳ Waiting 10 seconds..."
sleep 10

# Test if it fixed the issue
echo "🧪 Testing frontend access:"
RESPONSE=$(curl -s -o /dev/null -w %{http_code} http://sclsandbox.xyz)

if [ "$RESPONSE" != "200" ]; then
    echo "❌ Still getting $RESPONSE, trying network fix..."
    
    # Restart frontend and nginx to refresh network connections
    docker-compose -f docker-compose.prod.yml restart scli-frontend scli-nginx
    
    echo "⏳ Waiting 15 seconds for network refresh..."
    sleep 15
    
    # Final test
    echo "🧪 Final test after network refresh:"
    curl -I http://sclsandbox.xyz
else
    echo "✅ Frontend is working! Status: $RESPONSE"
    curl -I http://sclsandbox.xyz
fi

echo ""
echo "🎯 Complete status check:"
echo "Frontend: $(curl -s -o /dev/null -w %{http_code} http://sclsandbox.xyz)"
echo "API: $(curl -s -o /dev/null -w %{http_code} http://sclsandbox.xyz/api/health)" 
echo "LMS: $(curl -s -o /dev/null -w %{http_code} http://lms.sclsandbox.xyz)"