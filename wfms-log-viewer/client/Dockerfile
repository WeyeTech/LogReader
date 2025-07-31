# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Inject env var at build time
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the frontend
RUN npm run build

# ---- Final Stage: server will serve these static files
FROM alpine AS export
WORKDIR /build

# Only copy build output
COPY --from=build /app/build .
