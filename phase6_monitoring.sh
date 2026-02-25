#!/bin/bash
# Phase 6: Production Monitoring - Daily Health Check Script

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="/var/log/scl-production-health.log"
mkdir -p /var/log

echo "========================================" >> $LOG_FILE
echo "[$TIMESTAMP] Production Health Status" >> $LOG_FILE
echo "========================================" >> $LOG_FILE

# Backend API Health
echo "[API Health]" >> $LOG_FILE
curl -s -o /dev/null -w "Backend API (port 4000): %{http_code}\n" http://127.0.0.1:4000/api/health >> $LOG_FILE 2>&1 || echo "Backend API: UNREACHABLE" >> $LOG_FILE

# LAMP Moodle Health  
echo "[Moodle LAMP]" >> $LOG_FILE
curl -s -o /dev/null -w "LAMP Moodle (port 8888): %{http_code}\n" http://127.0.0.1:8888/moodle-prod/login/index.php >> $LOG_FILE 2>&1 || echo "LAMP Moodle: UNREACHABLE" >> $LOG_FILE

# Docker Moodle Health (legacy)
echo "[Moodle Docker]" >> $LOG_FILE
curl -s -o /dev/null -w "Docker Moodle (port 8080): %{http_code}\n" http://127.0.0.1:8080/moodle/login/index.php >> $LOG_FILE 2>&1 || echo "Docker Moodle: UNREACHABLE" >> $LOG_FILE

# Database Health
echo "[Database Health]" >> $LOG_FILE
echo -n "LAMP MySQL (moodle): " >> $LOG_FILE
if mysql -u moodleuser -pmoodlepass -e "SELECT 1;" > /dev/null 2>&1; then
  echo "OK" >> $LOG_FILE
else
  echo "FAILED" >> $LOG_FILE
fi

echo -n "Docker MySQL (scl_institute): " >> $LOG_FILE
if docker exec scli-mysql-prod mysql -u root -pRootSecurePass2024! -e "SELECT 1;" > /dev/null 2>&1; then
  echo "OK" >> $LOG_FILE
else
  echo "FAILED" >> $LOG_FILE
fi

# Data Integrity Check
echo "[Data Integrity]" >> $LOG_FILE
echo -n "SCL Courses: " >> $LOG_FILE
docker exec scli-mysql-prod mysql -u root -pRootSecurePass2024! scl_institute -e "SELECT COUNT(*) FROM courses" 2>/dev/null | tail -1 >> $LOG_FILE

echo -n "SCL Inductions: " >> $LOG_FILE
docker exec scli-mysql-prod mysql -u root -pRootSecurePass2024! scl_institute -e "SELECT COUNT(*) FROM course_inductions" 2>/dev/null | tail -1 >> $LOG_FILE

echo -n "SCL Requirements: " >> $LOG_FILE
docker exec scli-mysql-prod mysql -u root -pRootSecurePass2024! scl_institute -e "SELECT COUNT(*) FROM course_induction_requirements" 2>/dev/null | tail -1 >> $LOG_FILE

# Container Status
echo "[Container Status]" >> $LOG_FILE
docker ps --filter "status=running" --format "table {{.Names}}\t{{.Status}}" | grep -E "backend|mysql|moodle|frontend" >> $LOG_FILE
docker ps --filter "status=exited" --format "table {{.Names}}\t{{.Status}}" | wc -l | xargs echo "Stopped containers:" >> $LOG_FILE

# System Resources
echo "[System Resources]" >> $LOG_FILE
echo "Disk usage:" >> $LOG_FILE
df -h / | tail -1 >> $LOG_FILE
echo "Memory usage:" >> $LOG_FILE
free -h | tail -2 >> $LOG_FILE

echo "" >> $LOG_FILE

# Print summary to console
echo "✅ Health check completed at $TIMESTAMP"
echo ""
echo "Latest entries:"
tail -35 $LOG_FILE
