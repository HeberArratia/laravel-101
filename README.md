# HITOS · Laravel API REST

Guía estática navegable para un curso universitario: Laravel como API REST por estaciones (hitos).

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy en Vercel

1. Sube este repo a GitHub/GitLab/Bitbucket.
2. En [vercel.com](https://vercel.com): **Add New Project** → importa el repo.
3. Framework preset: **Vite** (o deja que lo detecte).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

El archivo `vercel.json` reescribe las rutas del SPA (`/hito/...`, `/utilidades`) hacia `index.html`.
