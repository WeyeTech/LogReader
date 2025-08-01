# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Serve build with lightweight HTTP server
FROM node:18-alpine
RUN npm install -g serve

WORKDIR /app
COPY --from=builder /app/build ./build

EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]
