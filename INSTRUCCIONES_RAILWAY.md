# 🚨 INSTRUCCIONES URGENTES PARA RAILWAY

## ⚠️ ERROR ACTUAL: "Railpack could not determine how to build the app"

Este error ocurre porque Railway está analizando la **RAÍZ** del repositorio, pero los proyectos están en `backend/` y `frontend/`.

## ✅ SOLUCIÓN (OBLIGATORIA):

### Debes configurar el **Root Directory** en Railway:

1. Ve a tu servicio en Railway Dashboard
2. Clic en **Settings** (⚙️)
3. Busca la sección **"Build & Deploy"** o **"Deploy"**
4. Encuentra **"Root Directory"** o **"Working Directory"**
5. **Cambia de `/` a `backend`** (para el servicio backend)
6. **Cambia de `/` a `frontend`** (para el servicio frontend)
7. **GUARDA** los cambios
8. Railway reconstruirá automáticamente

## 📍 Dónde encontrar Root Directory en Railway:

### Opción 1: En Settings
- Servicio → Settings → Build & Deploy → Root Directory

### Opción 2: En Variables
- Servicio → Variables → Busca "Root Directory" o "WORKING_DIR"

### Opción 3: Si no lo ves
- Busca "Service Settings" → "Deploy" → "Root Directory"
- O en la nueva UI: Settings → Service → Root Directory

## 🔧 Configuración por Servicio:

### Servicio BACKEND:
```
Root Directory: backend
Build Command: (vacío)
Start Command: npm start
```

### Servicio FRONTEND:
```
Root Directory: frontend
Build Command: npm run build
Start Command: npm start
```

## 📝 Variables de Entorno:

### Backend:
```
DATABASE_URL=${{ DATABASE_URL }}
FRONTEND_URL=https://tu-frontend.railway.app
```

### Frontend:
```
VITE_API_URL=https://almacenamiento-de-facturas-inventory-production.up.railway.app/api
```

## ⚡ Si NO configuras Root Directory:

- ❌ Railway seguirá analizando la raíz
- ❌ No encontrará `package.json`
- ❌ El build fallará siempre
- ❌ **NO FUNCIONARÁ**

## ✅ Después de configurar Root Directory:

- ✅ Railway analizará `backend/` o `frontend/`
- ✅ Encontrará el `package.json` correcto
- ✅ El build funcionará
- ✅ La aplicación se desplegará

---

**⚠️ ESTO ES OBLIGATORIO. Sin Root Directory, Railway NO puede construir tu aplicación.**

