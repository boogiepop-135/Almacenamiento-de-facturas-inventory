import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);

export default Document;

