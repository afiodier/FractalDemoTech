FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # optional if you want to compile TS

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 6003
CMD ["node", "src/index.js"]