const express = require('express');
const multer = require('multer');
const { authenticateToken, requireChauffeur } = require('../middleware/auth');
const { uploadChauffeurPhoto } = require('../controllers/chauffeurPhotoController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/photo',
  authenticateToken,
  requireChauffeur,
  upload.single('photo'),
  uploadChauffeurPhoto
);

module.exports = router;
