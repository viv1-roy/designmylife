const mongoose = require('mongoose');

const fileMetaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  compressedPath: {
    type: String,
    required: true
  },
  originalSize: {
    type: Number,
    required: true
  },
  compressedSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  compressionRatio: {
    type: Number
  },
  relatedTo: {
    type: String,
    enum: ['goal', 'task', 'habit', 'general'],
    default: 'general'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate compression ratio before saving
fileMetaSchema.pre('save', function(next) {
  if (this.originalSize && this.compressedSize) {
    this.compressionRatio = ((this.originalSize - this.compressedSize) / this.originalSize * 100).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('FileMeta', fileMetaSchema);
