const prisma = require('../config/prisma');
const {
  isCloudinaryConfigured,
  configureCloudinary,
  uploadImageBuffer,
} = require('../config/cloudinary');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function uploadChauffeurPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie',
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Format non supporté. Utilisez JPEG, PNG ou WebP.',
      });
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'Image trop volumineuse (max 5 Mo)',
      });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          'Stockage photo non configuré. Ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.',
      });
    }

    configureCloudinary();

    const chauffeurId = req.user.chauffeurId;
    const uploadResult = await uploadImageBuffer(
      req.file.buffer,
      `chauffeur-${chauffeurId}-${Date.now()}`
    );

    const chauffeur = await prisma.chauffeur.update({
      where: { id: chauffeurId },
      data: { photoUrl: uploadResult.secure_url },
      select: {
        id: true,
        photoUrl: true,
      },
    });

    return res.json({
      success: true,
      message: 'Photo de profil mise à jour',
      photoUrl: chauffeur.photoUrl,
    });
  } catch (error) {
    console.error('Erreur upload photo chauffeur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du téléversement de la photo',
    });
  }
}

module.exports = {
  uploadChauffeurPhoto,
};
