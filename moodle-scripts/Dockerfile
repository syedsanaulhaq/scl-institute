FROM bitnamilegacy/moodle:4.3

# Copy SCL SSO plugin to the correct location
USER root
COPY local/sclsso /bitnami/moodle/local/sclsso
RUN chown -R daemon:daemon /bitnami/moodle/local/sclsso
RUN chmod -R 755 /bitnami/moodle/local/sclsso

USER daemon