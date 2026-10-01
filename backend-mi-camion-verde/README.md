# EcoRuta API

Backend Express para horarios de recolección.

## Scripts

- `npm run dev` — desarrollo con nodemon
- `npm start` — producción
- `npm run seed` — carga el SQL de `docs/04_Base_de_Datos_EcoRuta.sql`

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servicio |
| GET | `/api/zonas` | Listado de zonas |
| GET | `/api/barrios` | Barrios (`?zona=&q=`) |
| GET | `/api/barrios/:id` | Detalle de barrio |
| GET | `/api/barrios/:id/horarios` | Horarios semanales |
| GET | `/api/barrios/:id/proximas` | Próximas recolecciones |
| GET | `/api/barrios/:id/hoy` | Recolecciones de hoy |
| GET | `/api/novedades` | Avisos activos |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/registro` | Registro ciudadano |
