import Redis from 'ioredis';

const REDIS_KEY = 'house:ids';
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

export const getAllIds = async () => {
  return await redis.smembers(REDIS_KEY);
};

export const addIds = async (ids) => {
  if (ids.length === 0) return;
  await redis.sadd(REDIS_KEY, ...ids);
};

export const closeRedis = async () => {
  await redis.quit();
};

export const clearAllIds = async () => {
  return await redis.del(REDIS_KEY);
};

export default redis;
