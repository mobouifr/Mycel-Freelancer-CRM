FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
# Install dependencies using `npm install` on the temporary folder (avoids volume overwriting issues)
RUN npm install --legacy-peer-deps
# it also could be RUN npm ci --legacy-peer-deps, i need to investigate it more, but for now it works fine with npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
