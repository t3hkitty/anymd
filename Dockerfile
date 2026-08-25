# Meow Black Box & Library Companion MD Dockerfile
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/anymd
COPY --from=build /app/meow_root_index.html /usr/share/nginx/html/index.html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
