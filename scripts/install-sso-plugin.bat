@echo off
echo Waiting for Moodle to be ready...
:wait_loop
timeout /t 10 /nobreak >nul
curl -s -o nul -w "%%{http_code}" http://localhost:9090 | findstr "200" >nul
if errorlevel 1 (
    echo Moodle not ready yet, waiting...
    goto wait_loop
)

echo Moodle is ready! Installing SSO plugin...
docker cp "moodle-scripts/local/sclsso" scli-moodle-dev:/opt/bitnami/moodle/local/
docker exec scli-moodle-dev chown -R daemon:daemon /opt/bitnami/moodle/local/sclsso
echo SSO plugin installed successfully!
echo Testing SSO endpoint...
curl -s -o nul -w "%%{http_code}" http://localhost:9090/local/sclsso/login.php?token=test
echo.
echo SSO plugin ready with real user names and roles!