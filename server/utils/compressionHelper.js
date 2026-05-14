const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');

/**
 * Decompress a file and return its buffer
 */
const decompressFile = async (compressedPath) => {
  try {
    const directory = await unzipper.Open.file(compressedPath);
    const file = directory.files[0]; // Get first file from archive
    
    if (!file) {
      throw new Error('No file found in archive');
    }

    const buffer = await file.buffer();
    return {
      buffer,
      fileName: file.path
    };
  } catch (error) {
    console.error('Decompression error:', error);
    throw new Error('Failed to decompress file');
  }
};

/**
 * Delete a compressed file
 */
const deleteCompressedFile = async (compressedPath) => {
  try {
    if (fs.existsSync(compressedPath)) {
      fs.unlinkSync(compressedPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('Failed to delete compressed file');
  }
};

/**
 * Get file stats
 */
const getFileStats = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return fs.statSync(filePath);
    }
    return null;
  } catch (error) {
    console.error('File stats error:', error);
    return null;
  }
};

module.exports = {
  decompressFile,
  deleteCompressedFile,
  getFileStats
};
