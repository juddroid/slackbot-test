import express from 'express';
import { WebClient } from '@slack/web-api';
import { createEventAdapter } from '@slack/events-api';
import { createServer } from 'http';
import CONFIG from '../config/bot.json';
import { getListFromJSON, getRandomNumber, isBot, isValid } from './util';
import { VALID_KEYWORD } from './const';
import DATA from './data.json';

const app = express();
const PORT = app.set('port', process.env.PORT || 3000);
const slackEvents = createEventAdapter(CONFIG.SIGNING_SECRET);
const webClient = new WebClient(CONFIG.BOT_USER_OAUTH_ACCESS_TOKEN);

slackEvents.on('message', async (e) => {
  const { text, channel, bot_id } = e;
  if (!text) return;

  const keyword = isValid(text, VALID_KEYWORD);
  const bot = isBot(bot_id);

  if (bot) return;
  if (keyword) {
    const list = getListFromJSON(DATA.lunch);
    const idx = getRandomNumber(list);
    const { store, path } = list[idx];

    webClient.chat.postMessage({
      text: `오늘은 ${store} 어때요?\r${path}`,
      channel: channel,
    });
    return;
  }
  if (!keyword) {
    webClient.chat.postMessage({
      text: `hint: 밥, 뭐먹지, 점심, 점심뭐먹지, 배고파`,
      channel: channel,
    });
    return;
  }
});

app.use('/slack/events', slackEvents.requestListener());

createServer(app).listen(PORT, () => {
  console.log('run slack bot');
});
