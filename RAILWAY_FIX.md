# 🔧 SOLUCIÓN: Error de Nixpacks en Railway

## ⚠️ El Problema

Railway está analizando la **raíz del repositorio** en lugar de las carpetas `backend/` o `frontend/`. Esto causa el error porque la raíz no tiene un `package.json`.

## ✅ La Solución

**DEBES configurar el Root Directory en cada servicio de Railway:**

### Para el Backend:

1. Ve a tu servicio de **backend** en Railway
2. Clic en **Settings** (o ⚙️)
3. Ve a la sección **Build & Deploy**
4. En **Root Directory**, escribe: `backend`
5. **Build Command**: (dejar VACÍO - Railway detectará automáticamente)
6. **Start Command**: `npm start`
7. Guarda los cambios
8. Railway debería reconstruir automáticamente

### Para el Frontend:

1. Crea un **nuevo servicio** en el mismo proyecto
2. Clic en **Settings** (o ⚙️)
3. Ve a la sección **Build & Deploy**
4. En **Root Directory**, escribe: `frontend`
5. **Build Command**: `npm run build`
6. **Start Command**: `npm start`
7. Guarda los cambios

## 📝 Variables de Entorno

### Backend:
```
DATABASE_URL=${{ DATABASE_URL }}
FRONTEND_URL=https://tu-frontend.railway.app
```

### Frontend:
```
VITE_API_URL=https://almacenamiento-de-facturas-inventory-production.up.railway.app/api
```

## 🎯 Paso a Paso Visual

1. **Servicio Backend** → Settings → Build & Deploy
2. Busca **"Root Directory"** o **"Working Directory"**
3. Cambia de `/` (raíz) a `backend`
4. Guarda
5. Railway reconstruirá automáticamente

## ⚡ Si aún no funciona:

1. Elimina el servicio actual del backend
2. Crea uno nuevo desde GitHub
3. **INMEDIATAMENTE** ve a Settings → Root Directory → `backend`
4. Luego configura las variables de entorno

---

**IMPORTANTE:** El Root Directory es **ESENCIAL**. Sin él, Railway no sabrá dónde está el `package.json`.

