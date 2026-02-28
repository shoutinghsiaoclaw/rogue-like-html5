# Use lightweight nginx image
FROM nginx:alpine

# Copy our game files
COPY index.html /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
