import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// Configuración de PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PGURI || 'postgres://postgres:postgres@localhost:5432/documentos';

// Log de la URL (sin contraseña visible)
const dbUrlForLog = DATABASE_URL ? DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'no configurada';
console.log('📊 Configuración de PostgreSQL:');
console.log(`   URL: ${dbUrlForLog}`);
console.log(`   SSL: ${process.env.PGSSL === 'true' ? 'habilitado' : 'deshabilitado'}`);

// Configurar SSL para Railway/Heroku (requieren SSL)
const sslConfig = process.env.DATABASE_URL?.includes('railway.app') || 
                  process.env.DATABASE_URL?.includes('amazonaws.com') ||
                  process.env.DATABASE_URL?.includes('heroku') ||
                  process.env.PGSSL === 'true'
  ? { rejectUnauthorized: false }
  : undefined;

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: sslConfig
});

async function ensureSchema() {
  try {
    // Probar conexión primero
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado a PostgreSQL');
    
    // Crear esquema
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        filename TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        size BIGINT NOT NULL,
        upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        data BYTEA NOT NULL
      );
    `);
    console.log('✅ Esquema verificado en PostgreSQL');
  } catch (error) {
    console.error('❌ Error verificando esquema de PostgreSQL:', error.message);
    console.error('   Asegúrate de configurar DATABASE_URL en Railway');
    console.error('   Si usas Railway PostgreSQL plugin, usa: DATABASE_URL=${{ DATABASE_URL }}');
    // No salir del proceso, permitir que el servidor corra (puede que la DB se conecte después)
  }
}

ensureSchema();

// Configuración de Multer en memoria (no usa disco)
const storage = multer.memoryStorage();

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

    const insertResult = await pool.query(
      'INSERT INTO documents (filename, mimetype, size, data) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.file.originalname, req.file.mimetype, req.file.size, req.file.buffer]
    );

    const fileId = insertResult.rows[0].id;

    // Generar URL - usar variable de entorno si está disponible (Railway)
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/api/files/${fileId}`;

    res.status(200).json({
      message: 'Archivo subido exitosamente',
      fileId,
      filename: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Error en la subida:', error);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

// Ruta para obtener archivo
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await pool.query('SELECT filename, mimetype, data FROM documents WHERE id = $1', [fileId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const { filename, mimetype, data } = result.rows[0];
    res.setHeader('Content-Type', mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(Buffer.from(data));
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
    const result = await pool.query('SELECT id, filename, mimetype, size, upload_date FROM documents ORDER BY upload_date DESC');
    const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `${req.protocol}://${req.get('host')}`;
    const documentsWithUrl = result.rows.map(doc => ({
      _id: doc.id,
      fileId: doc.id,
      filename: doc.filename,
      mimetype: doc.mimetype,
      size: Number(doc.size),
      uploadDate: doc.upload_date,
      url: `${baseUrl}/api/files/${doc.id}`
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
    const { fileId } = req.params;
    await pool.query('DELETE FROM documents WHERE id = $1', [fileId]);
    res.json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
});

// No se requiere almacenamiento en disco; multer usa memoria

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

