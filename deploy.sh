#!/bin/bash
# Deploy develop to production and restart services
# Usage: bash deploy.sh

set -e

REMOTE_SERVER="185.211.6.60"
REMOTE_USER="root"
REPO_DIR="/home/scl-institute"

echo "=========================================="
echo "DEPLOYING TO PRODUCTION"
echo "=========================================="

# Step 1: Pull latest develop
echo "[1/5] Pulling latest develop..."
git fetch origin
git checkout develop
git pull origin develop

# Step 2: Merge develop into production
echo "[2/5] Merging develop into production..."
git checkout production
git merge develop --no-edit

# Step 3: Push production to GitHub
echo "[3/5] Pushing to GitHub..."
git push origin production

# Step 4: Pull on server
echo "[4/5] Pulling on production server..."
ssh -l $REMOTE_USER $REMOTE_SERVER "cd $REPO_DIR && git pull origin production"

# Step 5: Restart docker and LAMP
echo "[5/5] Restarting services..."
ssh -l $REMOTE_USER $REMOTE_SERVER "cd $REPO_DIR && docker-compose restart && service apache2 restart && service mysql restart"

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "=========================================="
