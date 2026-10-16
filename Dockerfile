FROM node:22-alpine AS dependencies

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

FROM dependencies AS development

ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM node:22-alpine AS build

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
