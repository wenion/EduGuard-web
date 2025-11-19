# Serve the exported site with nginx
FROM nginx:1.27-alpine AS runner
COPY out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
