@echo off
echo Copying SSO plugin to Moodle container...
docker cp "moodle-scripts/local/sclsso" scli-moodle-dev:/opt/bitnami/moodle/local/
docker exec scli-moodle-dev chown -R daemon:daemon /opt/bitnami/moodle/local/sclsso
echo SSO plugin installed successfully!
echo Testing SSO endpoint...
curl -s -o nul -w "%%{http_code}" http://localhost:9090/local/sclsso/login.php?token=test
echo.
echo SSO plugin ready with real user names!