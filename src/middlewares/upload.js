const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const { env } = require('../config/env');

const uploadDirectory = path.resolve(process.cwd(), 'public', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename(req, file, callback) {
    const extension = allowedMimeTypes.get(file.mimetype);
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 5 },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Formato inválido. Envie JPG, PNG ou WEBP.');
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

module.exports = { upload, uploadDirectory };
