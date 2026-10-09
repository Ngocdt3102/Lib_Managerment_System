# Multi-stage build cho Frontend React.js (Vite)
FROM node:24-alpine AS build
WORKDIR /app

# Copy package.json và cài đặt node modules
COPY package*.json ./
RUN npm install

# Copy mã nguồn và build bundle tĩnh (dist)
COPY . ./
RUN npm run build

# Nginx web server phục vụ file tĩnh
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
