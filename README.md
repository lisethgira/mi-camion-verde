# EcoRuta — Mi Camión Verde

PWA para consultar horarios de recolección de residuos.

## Estructura

- `frontend-mi-camion-verde` — React + Vite + Tailwind + PWA (despliegue en **Vercel**)
- `backend-mi-camion-verde` — Node.js + Express + MySQL Clever Cloud
- `docs/` — SQL, MER y documentación

## 1. Base de datos (Clever Cloud)

1. Copia las variables del add-on MySQL a `backend-mi-camion-verde/.env` (usa `.env.example` como plantilla).
2. Desde el backend:

```bash
cd backend-mi-camion-verde
npm install
npm run seed
```

Si `seed` falla con `ETIMEDOUT`, autoriza tu IP en Clever Cloud o carga `docs/04_Base_de_Datos_EcoRuta.sql` con MySQL Workbench / DBeaver.

## 2. Backend local

```bash
cd backend-mi-camion-verde
npm run dev
```

API en `http://localhost:3001` — health: `GET /api/health`

## 3. Frontend local

```bash
cd frontend-mi-camion-verde
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite hace proxy de `/api` al backend.

## 4. Despliegue Vercel (frontend)

1. Importa el repo en Vercel y elige la carpeta `frontend-mi-camion-verde` como root.
2. Build: `npm run build` · Output: `dist`
3. Variable `VITE_API_URL` = URL pública de tu API (ej. `https://api-ecoruta.onrender.com/api`)

**Nota:** Vercel sirve el frontend. El backend Express conviene desplegarlo en Clever Cloud, Render o Railway y apuntar `CORS_ORIGIN` al dominio de Vercel.

## Usuarios de prueba (tras el seed)

| Correo | Contraseña | Rol |
|--------|------------|-----|
| ana@correo.com | Eco2026* | ciudadano |
| operador@ecoruta.co | Eco2026* | operador |
| admin@ecoruta.co | Eco2026* | administrador |

## Seguridad

No subas `.env` al repositorio. Si compartiste la contraseña de MySQL en un chat, rótala en Clever Cloud.
