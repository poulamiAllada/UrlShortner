import express from 'express';
import * as controller from '../controllers/url.controller.js'

const router = express.Router();

router.post('/shorten', controller.createShortUrl);
router.get('/:code', controller.redirectUrl);

export default router;
