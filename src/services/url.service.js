import { query } from '../config/db.js';
import redis from '../config/cache.js';

const createShortUrl = async (originalUrl) => {
  const base = process.env.SHORT_URL.replace(/\/$/, '');

  const insertResult = await query(
    `INSERT INTO urls(long_url)
     VALUES($1)
     ON CONFLICT (long_url) DO NOTHING
     RETURNING id`,
    [originalUrl]
  );

  let id, shortCode;

  if (insertResult.rows.length) {
    id = insertResult.rows[0].id;
    shortCode = convertToB62(id);

    await query(
      'UPDATE urls SET short_code = $1 WHERE id = $2',
      [shortCode, id]
    );

  } else {
    const existing = await query(
      'SELECT id, short_code FROM urls WHERE long_url = $1',
      [originalUrl]
    );

    id = existing.rows[0].id;
    shortCode = existing.rows[0].short_code;

    if (!shortCode) {
      shortCode = convertToB62(id);

      await query(
        'UPDATE urls SET short_code = $1 WHERE id = $2',
        [shortCode, id]
      );
    }
  }

  redis
    .set(`url:${shortCode}`, originalUrl, { ex: 3600 })
    .catch((err) => console.error('Redis Error:', err.message));

  return `${base}/api/urls/${shortCode}`;
};

const getOriginalUrl = async (code) => {
  const key = `url:${code}`;

  const cachedValue = await redis.get(key);
  if (cachedValue) return cachedValue;

  const result = await query(
    'SELECT long_url FROM urls WHERE short_code = $1',
    [code]
  );

  if (result.rows.length) {
    const longUrl = result.rows[0].long_url;

    redis
      .set(key, longUrl, { ex: 3600 })
      .catch((err) => console.error('Redis Error:', err.message));

    return longUrl;
  }

  return null;
};

const convertToB62 = (num) => {
  const OFFSET = 100000;
  num += OFFSET;

  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let str = '';

  while (num > 0) {
    str = chars[num % 62] + str;
    num = Math.floor(num / 62);
  }

  return str || '0';
};

export { createShortUrl, getOriginalUrl, convertToB62 };