#!/bin/bash
# Deploy public portal updates to production

echo "Pulling latest code from GitHub..."
cd /opt/scl-institute
git pull origin develop

echo "Rebuilding public portal container..."
docker-compose -f docker-compose.prod.yml build scli-public-portal

echo "Restarting public portal..."
docker-compose -f docker-compose.prod.yml up -d scli-public-portal

echo "Deployment complete!"
docker-compose -f docker-compose.prod.yml ps scli-public-portal
