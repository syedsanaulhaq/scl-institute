#!/bin/bash
# VERIFY_AND_START_SYSTEM.sh
# Run this script to verify and start the system before presenting

echo "================================================"
echo "SCL INSTITUTE SYSTEM - PRE-PRESENTATION CHECK"
echo "================================================"
echo ""

# Check if Docker is running
echo "Step 1: Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check current directory
echo "Step 2: Verifying workspace..."
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Are you in the project directory?"
    exit 1
fi
echo "✅ docker-compose.yml found"
echo ""

# Start containers
echo "Step 3: Starting containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers."
    exit 1
fi
echo "✅ Containers starting..."
echo ""

# Wait for services
echo "Step 4: Waiting for services to be ready (60 seconds)..."
sleep 60
echo "✅ Services should be ready"
echo ""

# Check containers are running
echo "Step 5: Verifying all containers are running..."
RUNNING=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -c "Up")
if [ "$RUNNING" -lt 4 ]; then
    echo "❌ Not all containers are running. Check with: docker ps"
    exit 1
fi
echo "✅ All containers running"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""

# Test API
echo "Step 6: Testing API endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/students/applications)
if [ "$RESPONSE" != "200" ]; then
    echo "❌ API returned $RESPONSE (expected 200)"
    exit 1
fi
echo "✅ API responding (HTTP $RESPONSE)"
echo ""

# Test database
echo "Step 7: Testing database..."
APPS=$(docker exec scli-mysql mysql -u scl_user -pscl_password scl_institute -s -e "SELECT COUNT(*) FROM student_applications;" 2>/dev/null)
COURSES=$(docker exec scli-mysql mysql -u scl_user -pscl_password scl_institute -s -e "SELECT COUNT(*) FROM course_lifecycle_master;" 2>/dev/null)

if [ -z "$APPS" ] || [ -z "$COURSES" ]; then
    echo "❌ Could not query database"
    exit 1
fi

echo "✅ Database checked"
echo "   - Applications: $APPS"
echo "   - Courses: $COURSES"
echo ""

# Final check
echo "Step 8: Final verification..."
if [ "$APPS" -ge "10" ] && [ "$COURSES" -ge "52" ]; then
    echo "✅ All data present"
else
    echo "⚠️  Warning: Expected 10 apps and 52 courses, got $APPS and $COURSES"
fi
echo ""

# Browser access info
echo "================================================"
echo "✅ SYSTEM READY FOR PRESENTATION!"
echo "================================================"
echo ""
echo "Access the dashboard:"
echo "  URL: http://localhost:3000"
echo "  Email: admin@sclsandbox.xyz"
echo "  Password: password123"
echo ""
echo "Demo flow:"
echo "  1. Show Dashboard with 10 modules"
echo "  2. Go to Admissions Hub - show 10 applications"
echo "  3. Go to Course Lifecycle - show 52 courses"
echo ""
echo "Files for reference:"
echo "  - START_HERE.txt (quick guide)"
echo "  - PRE_PRESENTATION_CHECKLIST.md (verification steps)"
echo "  - QUICK_START_FOR_PRESENTATION.md (demo walkthrough)"
echo ""
echo "Good luck! 🎉"
