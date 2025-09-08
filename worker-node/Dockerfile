# worker-node/Dockerfile
FROM node:24 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime image
FROM node:24
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# (If you want to keep the source for debugging, copy also /app/src)

# Expose the worker port
EXPOSE 6003

# Use the compiled JavaScript
CMD ["node", "dist/index.js"]