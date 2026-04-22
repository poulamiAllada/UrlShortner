import * as service from '../services/url.service.js';
const createShortUrl = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `rate:shorten:${ip}`;
  const allowed = await checkRateLimit(key);
  if (!allowed) {
    return res.status(429).json({
      message: 'Too many requests, please try again later'
    });
  }

  const shortUrl = await service.createShortUrl(req.body.url);
  res.json({ shortUrl });
};

const redirectUrl = async (req, res) => {
  const url = await service.getOriginalUrl(req.params.code);
  if (!url) return res.status(404).send('Not found');
  res.redirect(url);
};

export { createShortUrl, redirectUrl};

