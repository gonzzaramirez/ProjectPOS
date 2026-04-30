# POS project - guia de estabilidad

## 1) Quickstart
- Requisitos: Node LTS, npm, PostgreSQL.
- Front:
  - `cd Front`
  - `npm install`
  - `npm run dev`
- Back:
  - `cd back`
  - `npm install`
  - copiar `.env.example` a `.env`
  - `npm run start:dev`

## 2) Build limpio
- Back: `cd back && npm run build`
- Front: `cd Front && npm run build`
- Estado actual: ambos builds pasan.

## 3) Variables de entorno (back)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `NODE_ENV`

Base: `back/.env.example`.

## 4) Prisma (back)
- Schema: `back/prisma/schema.prisma`
- Migraciones: `back/prisma/migrations`
- Seed: `back/prisma/seed.ts`
- Comandos utiles:
  - `cd back`
  - `npx prisma validate`
  - `npx prisma generate`
  - `npm run seed`

## 5) Scripts clave
- Front (`Front/package.json`):
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
- Back (`back/package.json`):
  - `npm run start:dev`
  - `npm run build`
  - `npm run test`
  - `npm run test:e2e`
  - `npm run seed`

## 6) Cambios de estabilizacion aplicados
- Back:
  - `back/src/market/market.service.ts`
    - `flags` ahora usa `Prisma.InputJsonValue`.
  - `back/src/users/users.service.ts`
    - `findByUsername` usa `findFirst` con `active: true` (evita error de `findUnique` con clave no unica).
- Front:
  - `Front/src/app/login/page.tsx`
    - se creo `default export` valido para evitar fallo de prerender en `/login`.

## 7) Troubleshooting rapido
- Error `default export is not a React Component`:
  - revisar que cada `app/**/page.tsx` tenga `export default`.
- Error Prisma `UserWhereUniqueInput`:
  - no usar `findUnique` con campos no unicos.
  - usar clave unica real o `findFirst`.
- Error de tipos JSON en Prisma:
  - usar `Prisma.InputJsonValue` en datos `Json`.

## 8) Checklist post-cambios
- [ ] `npm run build` en `back`
- [ ] `npm run build` en `Front`
- [ ] login renderiza en `/login`
- [ ] `.env` backend completo
- [ ] `npx prisma validate` sin errores
