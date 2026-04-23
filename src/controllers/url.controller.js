import * as service from '../services/url.service.js';
import { checkRateLimit } from '../utils/rateLimiter.js';

const createShortUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ message: 'url is required and must be a non-empty string' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: 'Invalid URL format. Must be a full URL e.g. https://example.com' });
    }

    if (url.length > 2048) {
      return res.status(400).json({ message: 'URL must not exceed 2048 characters' });
    }

    const ip = req.ip || req.socket.remoteAddress;
    const key = `rate:shorten:${ip}`;
    const allowed = await checkRateLimit(key);
    if (!allowed) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    const shortUrl = await service.createShortUrl(url.trim());
    return res.status(201).json({ shortUrl });
  } catch (err) {
    next(err);
  }
};

const redirectUrl = async (req, res, next) => {
  try {
    const url = await service.getOriginalUrl(req.params.code);
    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    return res.redirect(302, url);
  } catch (err) {
    next(err);
  }
};

export { createShortUrl, redirectUrl };
