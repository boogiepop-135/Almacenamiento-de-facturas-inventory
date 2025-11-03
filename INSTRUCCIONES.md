# Instrucciones de Instalación Rápida

## Pasos para ejecutar el proyecto

### 1. Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend` con:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/documentos
```

Inicia MongoDB si está instalado localmente, o usa una URL de MongoDB Atlas.

Luego ejecuta:
```bash
npm run dev
```

El backend estará en `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará en `http://localhost:3000`

## Notas Importantes

- Asegúrate de que MongoDB esté corriendo antes de iniciar el backend
- El directorio `uploads/temp` se crea automáticamente
- Los archivos se almacenan en MongoDB GridFS (colección `archivos.files` y `archivos.chunks`)
- Límite de tamaño por archivo: 10MB

