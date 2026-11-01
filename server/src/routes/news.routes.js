const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');

// Handled for /api/v1/news, /api/v1/events, and /api/v1/gallery
router.get('/', (req, res, next) => {
  if (req.baseUrl.endsWith('/events')) {
    return newsController.getEvents(req, res, next);
  }
  if (req.baseUrl.endsWith('/gallery')) {
    return newsController.getGallery(req, res, next);
  }
  return newsController.getNews(req, res, next);
});

router.get('/:slug', newsController.getNewsBySlug);

module.exports = router;
