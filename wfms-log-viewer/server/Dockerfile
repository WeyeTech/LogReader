# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# ---- Production Stage ----
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app /app

# Copy the frontend build output here
COPY --from=export /build ./build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
