FROM docker.io/nginx:latest

USER root
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx -R
ADD dist/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
USER 1001
ENTRYPOINT []
CMD [ "nginx", "-c", "/etc/nginx/nginx.conf" ]