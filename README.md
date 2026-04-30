# PWA Cantina Carnavales — Monte Caseros

Sistema de punto de venta (POS) offline-first para tablets, diseñado para entornos de alta demanda y conectividad inestable.

---

## Contexto y Problemática

- **Entorno:** Cantinas durante los carnavales de Monte Caseros.
- **Problemas a resolver:** Conectividad inestable, personal no técnico, necesidad de despacho rápido.
- **Solución:** Arquitectura Offline-First con sincronización en segundo plano.

---

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Next.js | SSR para carga inicial, React para interactividad |
| PWA | next-pwa / Workbox | Service Workers para cacheo offline |
| Estado Local | Dexie.js + React Query | Dexie maneja IndexedDB; React Query gestiona estado asíncrono y reintentos |
| UI | Shadcn/UI + Tailwind | Ligero, personalizable y accesible |
| Backend | NestJS | Arquitectura modular y escalable |
| Base de Datos | PostgreSQL | Sólida para transacciones financieras |
| ORM | Prisma | Tipado fuerte y queries seguras |
| Infraestructura | Dokploy (VPS) | Despliegue automatizado |

---

## Requisitos Funcionales

### Módulo 1 — Terminal POS (Core)

- **RF-01** Selección de productos mediante toques simples en grilla.
- **RF-02** Barra de categorías (Bebidas, Comida, Tragos) y buscador local instantáneo sin recarga.
- **RF-03** Carrito volátil con modificación de cantidades (+/-) y eliminación de ítems con un toque.
- **RF-04** Cálculo automático de subtotal y total en tiempo real (lado del cliente).
- **RF-05** Calculadora de vuelto con botones rápidos ($1000, $2000, $5000, Justo) y display grande y contrastado.
- **RF-06** Confirmación de venta: persiste en IndexedDB y limpia la interfaz para el siguiente cliente.

### Módulo 2 — Gestión de Caja y Turnos

- **RF-07** Apertura de caja: el cajero declara monto inicial (cambio chico) al iniciar turno.
- **RF-08** Cierre de caja (arqueo): reporte local con:
  - Total vendido (Efectivo vs. Digital).
  - Total esperado en caja (Inicio + Ventas Efectivo − Retiros).
- **RF-09** Retiros / sangría: registro de retiros de dinero durante la noche.

### Módulo 3 — Sincronización y Persistencia

- **RF-10** Sincronización en background: envío automático al servidor (NestJS) al detectar conexión.
- **RF-11** Indicador de estado (semáforo Verde/Rojo) con contador de ventas pendientes de sincronizar.

### Módulo 4 — Administración y Métricas (Back-Office)

- **RF-12** Dashboard: ventas totales, ticket promedio y productos más vendidos (Best Sellers).
- **RF-13** CRUD de productos, precios y stock inicial.
- **RF-14** Gestión de usuarios con roles: `Admin` y `Cajero`.

---

## Requisitos No Funcionales

### Performance

- **RNF-01** Latencia de UI < 100ms en cualquier interacción (Interaction to Next Paint).
- **RNF-02** Carga inicial interactiva < 1.5 segundos (assets cacheados con Service Workers).
- **RNF-03** Operación 100% offline para ventas por tiempo indefinido.

### UX / UI

- **RNF-04** Área táctil mínima de 48×48px (recomendado 72px) — diseño "Fat Finger" para tablets.
- **RNF-05** Modo oscuro por defecto (ahorro de batería, entorno nocturno).
- **RNF-06** Sistema de colores para estados:
  - 🟢 Verde → Venta OK / Cobrado
  - 🔴 Rojo → Error / Cancelar
  - 🟡 Amarillo → Alerta de stock o sin conexión

### Fiabilidad e Integridad

- **RNF-07** Idempotencia en el servidor: detección y descarte de ventas duplicadas mediante UUIDs generados en el cliente.
- **RNF-08** Persistencia local en IndexedDB / Dexie.js: datos no sincronizados sobreviven cierre del navegador o reinicio de tablet.

### Seguridad

- **RNF-09** Autenticación mediante PIN numérico de 4–6 dígitos para cajeros.
- **RNF-10** HTTPS obligatorio en toda comunicación cliente–servidor.

---

## Arquitectura General

```
Tablet (PWA)
├── Next.js + React (UI)
├── Dexie.js (IndexedDB — persistencia local)
├── React Query (estado asíncrono + reintentos)
├── Service Worker / Workbox (cache offline)
└── Background Sync → NestJS API
                          └── PostgreSQL (vía Prisma)
```

---

## Roles de Usuario

| Rol | Permisos |
|---|---|
| `Admin` | Acceso completo: back-office, productos, usuarios, métricas |
| `Cajero` | Acceso al POS, apertura/cierre de caja, retiros |
