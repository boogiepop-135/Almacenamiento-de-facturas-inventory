import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// URL del API - usar variable de entorno en producción o localhost en desarrollo
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadedFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedFile(response.data);
      setFile(null);
      // Limpiar el input
      e.target.reset();
      // Recargar lista de documentos
      fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Error al subir el archivo. Asegúrate de que el servidor esté corriendo.'
      );
    } finally {
      setUploading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (err) {
      console.error('Error obteniendo documentos:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este archivo?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/files/${fileId}`);
      fetchDocuments();
      if (uploadedFile && uploadedFile.fileId === fileId) {
        setUploadedFile(null);
      }
    } catch (err) {
      setError('Error al eliminar el archivo');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  // Cargar documentos al montar el componente
  React.useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="app">
      <div className="container">
        <h1>📄 Subida de Documentos</h1>
        <p className="subtitle">Sube archivos PDF e imágenes y obtén una URL</p>

        <div className="upload-section">
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-label">
                {file ? file.name : 'Seleccionar archivo'}
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="upload-button"
            >
              {uploading ? 'Subiendo...' : 'Subir Archivo'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {uploadedFile && (
            <div className="success-card">
              <h3>✅ Archivo subido exitosamente</h3>
              <div className="file-info">
                <p><strong>Nombre:</strong> {uploadedFile.filename}</p>
                <p><strong>Tamaño:</strong> {formatFileSize(uploadedFile.size)}</p>
                <p><strong>Tipo:</strong> {uploadedFile.mimetype}</p>
                <div className="url-container">
                  <p><strong>URL:</strong></p>
                  <div className="url-box">
                    <input
                      type="text"
                      value={uploadedFile.url}
                      readOnly
                      className="url-input"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(uploadedFile.url);
                        alert('URL copiada al portapapeles');
                      }}
                      className="copy-button"
                    >
                      📋 Copiar
                    </button>
                  </div>
                  <a
                    href={uploadedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-link"
                  >
                    Ver archivo →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="documents-section">
          <div className="section-header">
            <h2>Documentos Subidos</h2>
            <button onClick={fetchDocuments} className="refresh-button">
              🔄 Actualizar
            </button>
          </div>

          {loadingDocuments ? (
            <div className="loading">Cargando documentos...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">No hay documentos subidos aún</div>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc._id} className="document-card">
                  <div className="document-icon">
                    {doc.mimetype === 'application/pdf' ? '📄' : '🖼️'}
                  </div>
                  <div className="document-info">
                    <h3>{doc.filename}</h3>
                    <p className="document-meta">
                      {formatFileSize(doc.size)} • {formatDate(doc.uploadDate)}
                    </p>
                    <div className="document-actions">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button view"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(doc.url);
                          alert('URL copiada al portapapeles');
                        }}
                        className="action-button copy"
                      >
                        Copiar URL
                      </button>
                      <button
                        onClick={() => handleDelete(doc.fileId)}
                        className="action-button delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

