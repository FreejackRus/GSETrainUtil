FROM node:22-alpine AS builder
WORKDIR /app

ARG BACKEND_PORT
ENV VITE_API_BASE_URL=http://localhost:${BACKEND_PORT}/api/v1
ENV VITE_API_STORAGE_PHOTOS_URL=http://localhost:${BACKEND_PORT}/uploads

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build:prod

FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]