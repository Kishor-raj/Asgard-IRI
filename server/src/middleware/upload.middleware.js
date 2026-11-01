const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const makeStorage = (folder, resourceType) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const random = Math.round(Math.random() * 1e9);
      const public_id = `${Date.now()}-${random}`;
      const params = {
        folder: `asgard-iri/${folder}`,
        resource_type: resourceType,
        public_id,
      };
      if (resourceType === 'raw') {
        params.flags = 'attachment';
      }
      return params;
    },
  });
};

const makeFilter = (allowedMime) => {
  return (req, file, cb) => {
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMime.join(', ')}`), false);
    }
  };
};

const MAX_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024;

const PDF_MIME = ['application/pdf'];
const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALL_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const uploadResume = multer({
  storage: makeStorage('resumes', 'raw'),
  fileFilter: makeFilter(PDF_MIME),
  limits: { fileSize: MAX_SIZE },
});

const uploadPaper = multer({
  storage: makeStorage('papers', 'raw'),
  fileFilter: makeFilter(PDF_MIME),
  limits: { fileSize: MAX_SIZE },
});

const uploadBrief = multer({
  storage: makeStorage('briefs', 'raw'),
  fileFilter: makeFilter(PDF_MIME),
  limits: { fileSize: MAX_SIZE },
});

const uploadCertificate = multer({
  storage: makeStorage('certificates', 'raw'),
  fileFilter: makeFilter(PDF_MIME),
  limits: { fileSize: MAX_SIZE },
});

const uploadPhoto = multer({
  storage: makeStorage('photos', 'image'),
  fileFilter: makeFilter(IMAGE_MIME),
  limits: { fileSize: MAX_SIZE },
});

const uploadGallery = multer({
  storage: makeStorage('gallery', 'image'),
  fileFilter: makeFilter(IMAGE_MIME),
  limits: { fileSize: MAX_SIZE },
});

const uploadCover = multer({
  storage: makeStorage('covers', 'image'),
  fileFilter: makeFilter(IMAGE_MIME),
  limits: { fileSize: MAX_SIZE },
});

const uploadAny = multer({
  storage: makeStorage('misc', 'raw'),
  fileFilter: makeFilter(ALL_MIME),
  limits: { fileSize: MAX_SIZE },
});

module.exports = {
  uploadResume,
  uploadPaper,
  uploadBrief,
  uploadCertificate,
  uploadPhoto,
  uploadGallery,
  uploadCover,
  uploadAny,
};

