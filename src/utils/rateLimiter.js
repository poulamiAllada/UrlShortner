import redis from '../config/cache.js';

const RATE_LIMIT = 100;
const WINDOW = 60;

export const checkRateLimit = async (key) => {
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW);
    }
    return count <= RATE_LIMIT;
  } catch (err) {
    console.error('Rate limiter Redis error (failing open):', err.message);
    return true;
  }
};