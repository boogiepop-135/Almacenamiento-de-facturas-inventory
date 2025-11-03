import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Document from './models/Document.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configurar CORS para Railway
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean); // Elimina valores undefined/null

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/documentos';

// Log de la URL (sin contraseña visible)
const dbUrlForLog = MONGODB_URI ? MONGODB_URI.replace(/:[^:@]+@/, ':****@') : 'no configurada';
console.log('📊 Configuración de MongoDB:');
console.log(`   URL: ${dbUrlForLog}`);

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    // Inicializar GridFS
    const { GridFSBucket } = await import('mongodb');
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'archivos'
    });
    app.locals.bucket = bucket;
    console.log('✅ GridFS inicializado');
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.error('   Asegúrate de configurar MONGODB_URI en Railway');
    console.error('   Si usas Railway MongoDB plugin, usa: MONGODB_URI=${{ MONGO_URL }}');
  });

// Configuración de Multer para archivos temporales
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF e imágenes (JPEG, JPG, PNG, GIF)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: fileFilter
});

// Ruta para subir archivos
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const bucket = app.locals.bucket;
    if (!bucket) {
      return res.status(503).json({ error: 'GridFS no está disponible. Verifica la conexión a MongoDB.' });
    }

    const fileStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });

    const readStream = fs.createReadStream(req.file.path);

    readStream.pipe(fileStream);

    fileStream.on('error', (error) => {
      console.error('Error subiendo archivo a GridFS:', error);
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal
      res.status(500).json({ error: 'Error al subir el archivo' });
    });

    fileStream.on('finish', async () => {
      // Eliminar archivo temporal
      fs.unlinkSync(req.file.path);

      // Guardar información del documento en la base de datos
      const document = new Document({
        filename: req.file.originalname,
        fileId: fileStream.id.toString(),
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadDate: new Date()
      });

      await document.save();

      // Generar URL - usar variable de entorno si está disponible (Railway)
      const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/api/files/${fileStream.id}`;

      res.status(200).json({
        message: 'Archivo subido exitosamente',
        fileId: fileStream.id,
        filename: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    });
  } catch (error) {
    console.error('Error en la subida:', error);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

// Ruta para obtener archivo
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const bucket = app.locals.bucket;
    if (!bucket) {
      return res.status(503).json({ error: 'GridFS no está disponible. Verifica la conexión a MongoDB.' });
    }

    const ObjectId = mongoose.Types.ObjectId;

    if (!ObjectId.isValid(req.params.fileId)) {
      return res.status(400).json({ error: 'ID de archivo inválido' });
    }

    const fileId = new ObjectId(req.params.fileId);

    // Obtener información del archivo primero
    const cursor = bucket.find({ _id: fileId });
    const files = await cursor.toArray();
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const fileInfo = files[0];
    
    // Establecer headers antes de iniciar la descarga
    res.setHeader('Content-Type', fileInfo.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.filename}"`);

    // Crear stream de descarga y enviar al cliente
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', (error) => {
      console.error('Error descargando archivo:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al descargar el archivo' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error obteniendo archivo:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al obtener el archivo' });
    }
  }
});

// Ruta para listar todos los documentos
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find().sort({ uploadDate: -1 });
    // Generar URL base - usar variable de entorno si está disponible (Railway)
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `${req.protocol}://${req.get('host')}`;
    const documentsWithUrl = documents.map(doc => ({
      ...doc.toObject(),
      url: `${baseUrl}/api/files/${doc.fileId}`
    }));
    res.json(documentsWithUrl);
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error al obtener los documentos' });
  }
});

// Ruta para eliminar un documento
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const bucket = app.locals.bucket;
    if (!bucket) {
      return res.status(503).json({ error: 'GridFS no está disponible. Verifica la conexión a MongoDB.' });
    }

    const ObjectId = mongoose.Types.ObjectId;

    if (!ObjectId.isValid(req.params.fileId)) {
      return res.status(400).json({ error: 'ID de archivo inválido' });
    }

    const fileId = new ObjectId(req.params.fileId);
    
    // Eliminar de GridFS
    await bucket.delete(fileId);
    
    // Eliminar de la base de datos
    await Document.deleteOne({ fileId: req.params.fileId });

    res.json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
});

// Crear directorio de uploads si no existe
if (!fs.existsSync('uploads/temp')) {
  fs.mkdirSync('uploads/temp', { recursive: true });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
