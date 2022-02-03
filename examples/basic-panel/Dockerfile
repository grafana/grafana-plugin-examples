FROM grafana/grafana:latest

ENV GF_AUTH_ANONYMOUS_ORG_ROLE "Admin"
ENV GF_AUTH_ANONYMOUS_ENABLED "true"
ENV GF_AUTH_BASIC_ENABLED "false"
ENV GF_ENABLE_GZIP "true"
ENV GF_DEFAULT_APP_MODE "development"
ENV GF_INSTALL_PLUGINS "marcusolsson-static-datasource"

USER root
RUN sed -i 's/<\/body><\/html>/<script src=\"http:\/\/localhost:35729\/livereload.js\"><\/script><\/body><\/html>/g' /usr/share/grafana/public/views/index.html
