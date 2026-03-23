
# 新房源推播通知

> 本專案僅供**學術研究**與**個人學習**用途，不得用於任何商業目的。

## Preview
![demo image1](https://meee.com.tw/7CHSu3A.png)

## Start

install
```bash
npm install
```

create `.env` file and set variables

```bash
cp .env.example .env
```

```env
# 目標網址（租屋網搜尋結果頁面）
TARGET_URL=https://rent.591.com.tw/?region=1&section=...

# Telegram Bot 設定
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Crontab 設定執行時間
CRON_SCHEDULE=*/5 * * * *
```

start redis

```bash
docker-compose up -d
```

start script

```bash
npm start
```

clear redis data

```bash
npm run clear
```
