const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');
const upload = require('../middleware/upload');

// Rutas públicas
router.get('/', contentController.getContent);

// Rutas protegidas - solo admin
router.post('/',
  authMiddleware,
  adminMiddleware,
  upload.single('imagen'),
  contentController.createContent
);

router.put('/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('imagen'),
  contentController.updateContent
);

router.delete('/:id',
  authMiddleware,
  adminMiddleware,
  contentController.deleteContent
);

module.exports = router;