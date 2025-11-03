# Guía de Deployment en Railway

Esta guía te ayudará a desplegar el proyecto en Railway.

## 📋 Prerequisitos

1. Cuenta en [Railway](https://railway.app)
2. Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recomendado) o MongoDB instalado localmente
3. Git instalado

## 🚀 Paso 1: Preparar MongoDB

### Opción A: Railway MongoDB Plugin (Recomendado)

1. En tu proyecto de Railway, haz clic en **"+ New"** o **"Add Service"**
2. Selecciona **"Database"** → **"Add MongoDB"**
3. Railway creará automáticamente una base de datos MongoDB
4. Railway te proporcionará automáticamente la variable `MONGO_URL`
5. En las variables de entorno de tu servicio backend, configura:
   ```
   MONGODB_URI=${{ MONGO_URL }}
   ```
   O simplemente usa `MONGO_URL` directamente (el código detecta ambos)

### Opción B: MongoDB Atlas (Alternativa)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo cluster (puedes usar el tier gratuito)
3. Crea un usuario de base de datos
4. Habilita el acceso desde cualquier IP (0.0.0.0/0) en Network Access
5. Copia la cadena de conexión (Connection String)
6. Reemplaza `<password>` con tu contraseña y `<dbname>` con `documentos`
7. Configura en Railway: `MONGODB_URI=tu_cadena_de_conexion`

## 🚀 Paso 2: Desplegar el Backend

1. **Conecta tu repositorio a Railway:**
   - Ve a [Railway Dashboard](https://railway.app/dashboard)
   - Clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Selecciona la carpeta `backend` (o configura el Root Directory en Settings)

2. **Agrega MongoDB a tu proyecto:**
   - En el mismo proyecto de Railway, haz clic en **"+ New"** o **"Add Service"**
   - Selecciona **"Database"** → **"Add MongoDB"**
   - Railway creará la base de datos y configurará automáticamente `MONGO_URL`

3. **Configura las Variables de Entorno:**
   En la sección de Variables de tu servicio de backend, agrega:
   ```
   MONGODB_URI=${{ MONGO_URL }}
   FRONTEND_URL=https://tu-frontend.railway.app
   ```

   **Nota:** 
   - `MONGO_URL` se configura automáticamente si usas el plugin de MongoDB de Railway
   - `PORT` y `RAILWAY_PUBLIC_DOMAIN` también se proporcionan automáticamente
   - Si usas MongoDB Atlas, configura: `MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/documentos`

3. **Railway automáticamente:**
   - Detectará Node.js (gracias a `package.json`)
   - Instalará las dependencias (`npm install`)
   - Ejecutará `npm start` (definido en `package.json`)

4. **Obtén la URL pública:**
   - Ve a Settings → Networking
   - Clic en "Generate Domain"
   - Copia la URL (ej: `https://tu-backend.railway.app`)
   - Esta URL estará disponible en `RAILWAY_PUBLIC_DOMAIN`

## 🚀 Paso 3: Desplegar el Frontend

1. **Crea un nuevo servicio para el frontend:**
   - En el mismo proyecto de Railway, clic en "+ New"
   - Selecciona "GitHub Repo"
   - Selecciona la misma carpeta `frontend`

2. **Configura las Variables de Entorno:**
   ```
   VITE_API_URL=https://tu-backend.railway.app/api
   ```

3. **Configura el Build Command:**
   Railway debería detectar automáticamente Vite, pero si no:
   - Build Command: `npm run build`
   - Start Command: `npm run preview`

4. **Genera un dominio público:**
   - En la configuración del servicio frontend, genera un dominio público
   - Tu frontend estará disponible en `https://tu-frontend.railway.app`

## 🔧 Paso 4: Actualizar CORS en el Backend

Después de obtener la URL del frontend, actualiza la variable `FRONTEND_URL` en el backend:

```
FRONTEND_URL=https://tu-frontend.railway.app
```

Railway reiniciará automáticamente el servicio cuando cambies las variables de entorno.

## 📝 Variables de Entorno Resumen

### Backend
```
MONGODB_URI=${{ MONGO_URL }}
# O si usas MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/documentos
FRONTEND_URL=https://tu-frontend.railway.app
```

**Nota:** `PORT` y `RAILWAY_PUBLIC_DOMAIN` son proporcionados automáticamente por Railway.

### Frontend
```
VITE_API_URL=https://tu-backend.railway.app/api
```

**Nota:** Railway usa el puerto automáticamente asignado en `$PORT`.

## ✅ Verificación

1. Abre la URL del frontend en tu navegador
2. Intenta subir un archivo PDF o imagen
3. Verifica que recibas una URL válida
4. Prueba abrir la URL del archivo en una nueva pestaña

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
- Verifica que `MONGODB_URI` esté configurado correctamente
- Si usas Railway MongoDB plugin, usa: `MONGODB_URI=${{ MONGO_URL }}`
- Si usas MongoDB Atlas, verifica que tu IP esté permitida en Network Access
- Verifica que el usuario y contraseña sean correctos
- Asegúrate de que la URL incluya el nombre de la base de datos al final

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend sea correcta (incluye `https://`)
- Asegúrate de que no haya espacios extra en las variables de entorno
- Verifica que la URL del frontend coincida exactamente con `FRONTEND_URL`
- Revisa los logs del backend para ver qué origen está siendo bloqueado

### Archivos no se cargan
- Verifica que el directorio `uploads/temp` tenga permisos de escritura
- Revisa los logs de Railway para ver errores específicos

### Frontend no puede conectar al backend
- Verifica que `VITE_API_URL` sea correcta (debe incluir `/api` al final)
- Asegúrate de que el backend esté corriendo (verifica los logs en Railway)
- Verifica que la URL del backend sea accesible públicamente (debe tener dominio generado)
- Asegúrate de que el frontend se haya reconstruido después de cambiar `VITE_API_URL`
- Si usas `vite preview`, verifica que el puerto sea correcto

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app)
- [Documentación de MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Documentación de Vite](https://vitejs.dev)

