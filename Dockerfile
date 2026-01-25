# Serve the exported site with nginx
FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy static export
COPY out/ /usr/share/nginx/html/

# Copy our custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
