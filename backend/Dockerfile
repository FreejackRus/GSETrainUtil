# -------- build stage --------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY perechen.xlsx ./perechen.xlsx
COPY photos.xlsx ./photos.xlsx

RUN npm run build:ci
RUN npm prune --omit=dev   # prisma-cli оставь в "dependencies"

# -------- runtime stage --------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/perechen.xlsx ./perechen.xlsx
COPY --from=build /app/src/pdfGenerate/fonts ./dist/pdfGenerate/fonts

EXPOSE 3011
CMD ["node","dist/server.js"]
