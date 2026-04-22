import redis from '../cache.js';

const RATE_LIMIT = 100; 
const WINDOW = 60;

export const checkRateLimit = async (key) => {
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW);
  }

  if (count > RATE_LIMIT) {
    return false;
  }

  return true;
};