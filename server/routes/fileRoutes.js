const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
  getFileStats
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const compressionMiddleware = require('../middleware/compressionMiddleware');

router.post('/upload', protect, upload.single('file'), compressionMiddleware, uploadFile);
router.get('/', protect, getFiles);
router.get('/stats', protect, getFileStats);
router.get('/:id/download', protect, downloadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
