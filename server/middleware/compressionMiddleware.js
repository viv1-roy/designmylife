const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const compressionMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const timestamp = Date.now();
    const compressedFileName = `${timestamp}_${req.file.originalname}.zip`;
    const compressedPath = path.join(__dirname, '../storage/compressedFiles', compressedFileName);

    // Create write stream
    const output = fs.createWriteStream(compressedPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Append file from buffer
    archive.append(req.file.buffer, { name: req.file.originalname });

    // Finalize the archive
    await archive.finalize();

    // Wait for the output stream to finish
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });

    // Get compressed file stats
    const stats = fs.statSync(compressedPath);

    // Attach compression info to request
    req.compressionInfo = {
      originalName: req.file.originalname,
      compressedPath: compressedPath,
      originalSize: req.file.size,
      compressedSize: stats.size,
      mimeType: req.file.mimetype
    };

    next();
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ message: 'File compression failed', error: error.message });
  }
};

module.exports = compressionMiddleware;
