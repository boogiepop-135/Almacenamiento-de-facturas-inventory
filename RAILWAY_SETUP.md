# Configuración de Railway para Monorepo

Este proyecto es un monorepo con `backend/` y `frontend/` en carpetas separadas.

## ⚠️ IMPORTANTE: Configuración de Root Directory

Para que Railway funcione correctamente, **debes configurar el Root Directory** para cada servicio:

### Backend (Servicio 1)

1. Ve a tu servicio de backend en Railway
2. Settings → **Root Directory**: `backend`
3. Variables de entorno:
   ```
   DATABASE_URL=${{ DATABASE_URL }}
   FRONTEND_URL=https://tu-frontend.railway.app
   ```
4. Build Command: (dejar vacío, Railway detectará automáticamente)
5. Start Command: `npm start`

### Frontend (Servicio 2)

1. Crea un nuevo servicio en el mismo proyecto
2. Settings → **Root Directory**: `frontend`
3. Variables de entorno:
   ```
   VITE_API_URL=https://almacenamiento-de-facturas-inventory-production.up.railway.app/api
   ```
4. Build Command: `npm run build`
5. Start Command: `npm start`

## URL del Backend

El backend está configurado para usar:
- **URL de producción**: `https://almacenamiento-de-facturas-inventory-production.up.railway.app`

Asegúrate de actualizar `FRONTEND_URL` en el backend con la URL real de tu frontend cuando la tengas.

