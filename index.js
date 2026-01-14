import 'dotenv/config';
import cron from 'node-cron';
import { chromium } from 'playwright';
import { parseHouseItems } from './parse.js';
import { getAllIds, addIds, closeRedis } from './redis.js';
import { sendMessage } from './telegram.js';

const TARGET_URL = process.env.TARGET_URL;
const TARGET_ITEM_ELEMENT = process.env.TARGET_ITEM_ELEMENT;
const TARGET_ITEM_INFO_ELEMENT = process.env.TARGET_ITEM_INFO_ELEMENT;
const USER_AGENT = process.env.USER_AGENT;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/5 * * * *';
const TIME_OUT = 15000;
const BATCH_SIZE = 10;

const formatUpdateTime = (timeStr) => {
  if (!timeStr) return Infinity;
  if (timeStr.includes('剛剛')) return 0;
  if (timeStr.includes('今日')) return 60 * 12;
  if (timeStr.includes('昨日')) return 60 * 24;

  const match = timeStr.match(/(\d+)(分鐘|小時|天)/);
  if (!match) return Infinity;

  const num = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case '分鐘':
      return num;
    case '小時':
      return num * 60;
    case '天':
      return num * 60 * 24;
    default:
      return Infinity;
  }
};

const searchNewHouses = async () => {
  const currentTime = new Date().toLocaleString('zh-TW', { hour12: false });
  console.log(`[${currentTime}] 開始搜尋新房屋..`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: USER_AGENT,
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const page = await context.newPage();
  console.log('載入頁面中..');

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(TARGET_ITEM_INFO_ELEMENT, { timeout: TIME_OUT });
    console.log('成功，正在取得資料..');

    const houseData = await page.$$eval(TARGET_ITEM_ELEMENT, parseHouseItems);
    houseData.sort(
      (a, b) => formatUpdateTime(a.updateTime) - formatUpdateTime(b.updateTime)
    );

    const allIds = new Set(await getAllIds());
    const newHouseData = houseData.filter(
      (item) => item.id && !allIds.has(item.id)
    );

    if (newHouseData.length === 0) {
      console.log('沒有新房屋');
      return;
    }

    const totalBatches = Math.ceil(newHouseData.length / BATCH_SIZE);
    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * BATCH_SIZE;
      const batchItems = newHouseData.slice(
        startIndex,
        startIndex + BATCH_SIZE
      );

      const messageItems = batchItems.map((item, index) => {
        const topMark = item.isTop ? '【置頂】' : '';
        return [
          `${startIndex + index + 1}. 【${
            item.updateTime || '無時間'
          }】${topMark} \n${item.title}`,
          `價格：${item.price} 元/月`,
          `房型：${item.roomType} | 坪數：${item.area} | 樓層：${item.floor}`,
          `地點：${item.location}`,
          `捷運：${item.metroStation} ${item.metroDistance}`,
          `標籤：${item.tags.join(' | ')}`,
          `聯絡：${item.contact} | ${item.viewCount}`,
          `網址：<a href="${item.link}">${item.link}</a>`,
        ].join('\n');
      });

      const fullMessage = `
      🏠 新房屋通知 - ${currentTime}\n\n${messageItems.join(
        '\n\n━━━━━━━━━━━━━━━━\n\n'
      )}\n━━━━━━━━━━━━━━━━
    `;
      console.log('Message: ', fullMessage);
      await sendMessage(fullMessage);
    }

    const newIds = newHouseData.map((item) => item.id);
    await addIds(newIds);
  } catch (error) {
    console.error('Error: ', error);
  } finally {
    await browser.close();
    console.log('完成！等待下次搜尋..');
  }
};

console.log(`cron schedule: ${CRON_SCHEDULE}`);
searchNewHouses();

cron.schedule(CRON_SCHEDULE, () => {
  searchNewHouses();
});

process.on('SIGINT', async () => {
  console.log('Closing service');
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing service');
  await closeRedis();
  process.exit(0);
});
