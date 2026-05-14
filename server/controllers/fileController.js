const FileMeta = require('../models/FileMeta');
const { decompressFile, deleteCompressedFile } = require('../utils/compressionHelper');
const fs = require('fs');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.compressionInfo) {
      return res.status(400).json({ message: 'No file uploaded or compression failed' });
    }

    const { originalName, compressedPath, originalSize, compressedSize, mimeType } = req.compressionInfo;
    const { relatedTo, relatedId } = req.body;

    const fileMeta = await FileMeta.create({
      user: req.user._id,
      originalName,
      compressedPath,
      originalSize,
      compressedSize,
      mimeType,
      relatedTo: relatedTo || 'general',
      relatedId: relatedId || null
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: fileMeta._id,
        originalName: fileMeta.originalName,
        size: fileMeta.compressedSize,
        compressionRatio: fileMeta.compressionRatio,
        uploadedAt: fileMeta.uploadedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all files for user
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res) => {
  try {
    const { relatedTo, relatedId } = req.query;
    
    let filter = { user: req.user._id };
    if (relatedTo) filter.relatedTo = relatedTo;
    if (relatedId) filter.relatedId = relatedId;

    const files = await FileMeta.find(filter).sort({ uploadedAt: -1 });
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
const downloadFile = async (req, res) => {
  try {
    const fileMeta = await FileMeta.findById(req.params.id);

    if (!fileMeta) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership
    if (fileMeta.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Decompress file
    const { buffer, fileName } = await decompressFile(fileMeta.compressedPath);

    // Set headers for download
    res.setHeader('Content-Type', fileMeta.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileMeta.originalName}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send file
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const fileMeta = await FileMeta.findById(req.params.id);

    if (!fileMeta) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check ownership
    if (fileMeta.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete compressed file from storage
    await deleteCompressedFile(fileMeta.compressedPath);

    // Delete metadata
    await fileMeta.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get file stats
// @route   GET /api/files/stats
// @access  Private
const getFileStats = async (req, res) => {
  try {
    const files = await FileMeta.find({ user: req.user._id });

    const stats = {
      totalFiles: files.length,
      totalOriginalSize: files.reduce((sum, f) => sum + f.originalSize, 0),
      totalCompressedSize: files.reduce((sum, f) => sum + f.compressedSize, 0),
      avgCompressionRatio: files.reduce((sum, f) => sum + parseFloat(f.compressionRatio), 0) / Math.max(files.length, 1),
      spaceSaved: files.reduce((sum, f) => sum + (f.originalSize - f.compressedSize), 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
  getFileStats
};
