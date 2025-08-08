FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json tsconfig.json perechen.xlsx prisma ./
RUN npm install

COPY . .
RUN npm run build:ci

FROM node:22-alpine
WORKDIR /app

ARG PORT=3000
ENV PORT=${PORT}

COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/perechen.xlsx ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/pdfGenerate/fonts ./dist/pdfGenerate/fonts

EXPOSE ${PORT}

CMD ["sh","-c","npm run migrate && npm run import && npm run start"]