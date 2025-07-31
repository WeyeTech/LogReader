# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Final Stage: server will serve these static files
# We only extract the build directory
FROM alpine AS export
WORKDIR /build
COPY --from=build /app/build .
