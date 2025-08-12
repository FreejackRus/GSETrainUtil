FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json perechen.xlsx ./
COPY . .
RUN npm run build:ci
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/perechen.xlsx ./perechen.xlsx
COPY --from=build /app/src/pdfGenerate/fonts ./dist/pdfGenerate/fonts

CMD ["sh","-c","npm run migrate && npm run import && npm run start"]
