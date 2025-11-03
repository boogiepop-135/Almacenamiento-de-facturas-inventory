# Sistema de Subida de Documentos

Sistema completo para subir documentos PDF e imágenes con almacenamiento en MongoDB GridFS.

## 🚀 Características

- ✅ Subida de archivos PDF e imágenes (JPEG, JPG, PNG, GIF)
- ✅ Almacenamiento en MongoDB GridFS
- ✅ Generación de URLs para acceso a archivos
- ✅ Interfaz moderna y responsive
- ✅ Listado de todos los documentos subidos
- ✅ Eliminación de documentos
- ✅ Límite de tamaño: 10MB por archivo

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- MongoDB (local o remoto)
- npm o yarn

## 🛠️ Instalación

### Backend

1. Navega al directorio del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/documentos
```

4. Asegúrate de que MongoDB esté corriendo.

5. Inicia el servidor:
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El backend estará disponible en `http://localhost:5000`

### Frontend

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
.
├── backend/
│   ├── models/
│   │   └── Document.js      # Modelo de MongoDB para documentos
│   ├── uploads/
│   │   └── temp/            # Archivos temporales (se crea automáticamente)
│   ├── server.js            # Servidor Express principal
│   ├── package.json
│   └── .env                 # Variables de entorno (crear manualmente)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Componente principal
│   │   ├── App.css          # Estilos de la aplicación
│   │   ├── main.jsx         # Punto de entrada
│   │   └── index.css        # Estilos globales
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### POST /api/upload
Sube un archivo (PDF o imagen)

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (archivo a subir)

**Response:**
```json
{
  "message": "Archivo subido exitosamente",
  "fileId": "507f1f77bcf86cd799439011",
  "filename": "documento.pdf",
  "url": "http://localhost:5000/api/files/507f1f77bcf86cd799439011",
  "size": 123456,
  "mimetype": "application/pdf"
}
```

### GET /api/files/:fileId
Obtiene un archivo por su ID

### GET /api/documents
Lista todos los documentos subidos

### DELETE /api/files/:fileId
Elimina un archivo por su ID

## 🎨 Uso

1. Abre el frontend en `http://localhost:3000`
2. Selecciona un archivo PDF o imagen
3. Haz clic en "Subir Archivo"
4. Copia la URL generada para compartir o usar el archivo

## 🔧 Configuración

### MongoDB

Puedes usar MongoDB local o remoto. Ajusta la variable `MONGODB_URI` en el archivo `.env`:

- Local: `mongodb://localhost:27017/documentos`
- MongoDB Atlas: `mongodb+srv://usuario:password@cluster.mongodb.net/documentos`

### Puerto

Puedes cambiar el puerto del backend editando la variable `PORT` en `.env` o usando la variable de entorno del sistema. Railway usa automáticamente el puerto asignado.

## 🚀 Deployment en Railway

Este proyecto está configurado para desplegarse en Railway. Ver el archivo `DEPLOYMENT.md` para instrucciones detalladas.

### Resumen rápido:

1. **Backend:**
   - Conecta tu repositorio a Railway
   - Selecciona la carpeta `backend`
   - Configura las variables de entorno: `MONGODB_URI`, `FRONTEND_URL`
   - Railway usará automáticamente el puerto asignado

2. **Frontend:**
   - Crea un nuevo servicio en Railway
   - Selecciona la carpeta `frontend`
   - Configura la variable: `VITE_API_URL` con la URL de tu backend
   - Railway construirá y servirá el frontend automáticamente

Para más detalles, consulta `DEPLOYMENT.md`.

## 📝 Notas

- Los archivos se almacenan en MongoDB GridFS, ideal para archivos grandes
- Los archivos temporales se eliminan automáticamente después de subirlos
- El límite de tamaño por archivo es de 10MB (configurable en `server.js`)

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
- Asegúrate de que MongoDB esté corriendo
- Verifica que la URL de conexión en `.env` sea correcta

### Error al subir archivos
- Verifica que el directorio `uploads/temp` exista o tenga permisos de escritura
- Asegúrate de que el archivo no exceda el límite de 10MB

### CORS errors
- Asegúrate de que el backend esté corriendo en el puerto 5000
- Verifica la configuración de CORS en `server.js`

