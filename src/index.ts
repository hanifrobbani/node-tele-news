import * as dotenv from "dotenv";
import Bot from "./app/Bot.ts"

dotenv.config();
const token: undefined|string = process.env.BOT_TOKEN
const bot = new Bot(token)

bot.botStart()
bot.botReplySticker()
bot.botSendEarthquake(process.env.BMKG_API)
bot.botSendRandomNews(process.env.RANDOM_NEWS_API)
bot.launch(); // start  polling from telegraf
console.log("bot running");

dotenv.config();