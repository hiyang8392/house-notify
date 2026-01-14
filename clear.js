import { clearAllIds, getAllIds, closeRedis } from './redis.js';

const clear = async () => {
  try {
    const allIds = await getAllIds();
    if (allIds.length === 0) {
      console.log('沒有紀錄需要清除');
      return;
    }
  
    await clearAllIds();
    console.log('Done!');
  } catch (error) {
    console.error('Error: ', error.message);
  } finally {
    await closeRedis();
  }
};

clear();
