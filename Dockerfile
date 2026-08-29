# BimeNews - Liara production Docker (standalone)
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 1) Deps (cache-friendly)
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY package.json package-lock.json ./
RUN npm ci --include=optional

# 2) Source + build
COPY . .
RUN npx prisma generate

ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ARG NEXT_PUBLIC_SITE_URL=https://bimenews.com
ARG NEXT_PUBLIC_SITE_NAME=بیمه نیوز
ARG NEXT_PUBLIC_SITE_NAME_EN=BimeNews
ARG NEXT_PUBLIC_SITE_TAGLINE=پایگاه خبری صنعت بیمه
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_SITE_NAME_EN=$NEXT_PUBLIC_SITE_NAME_EN
ENV NEXT_PUBLIC_SITE_TAGLINE=$NEXT_PUBLIC_SITE_TAGLINE

RUN npm run build

# 3) Runner — only standalone output + assets (no 982MB node_modules copy)
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/prisma.config.ts ./prisma.config.ts
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/package.json ./package.json
# prisma CLI for runtime migrate
COPY --from=base /app/node_modules/prisma ./node_modules/prisma
COPY --from=base /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true

RUN mkdir -p /app/storage/uploads && chown -R node:node /app/storage 2>/dev/null || mkdir -p storage/uploads

USER node
EXPOSE 3000
CMD ["node", "scripts/start.mjs"]
