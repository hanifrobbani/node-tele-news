import { Telegraf, Context } from "telegraf";
import helpers from "../libs/helper.ts";
import commands from "../libs/commands.ts";
class Bot extends Telegraf<Context> {
    constructor(token: string | undefined) {
        if (!token) {
            throw new Error("BOT_TOKEN is not defined");
        }
        super(token)
    }

    botStart() {
        this.start((ctx) => ctx.reply(helpers.helperText, { parse_mode: "Markdown" }))
    }

    botReplySticker() {
        this.on("sticker", (ctx) => {
            const emojis = ["😂", "🔥", "👍", "😎", "🥱", "🙈"];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            if (randomEmoji) {
                console.log(`Send random emoji to ${ctx.from.first_name}`);

                return ctx.reply(randomEmoji, {
                    reply_parameters: {
                        message_id: ctx.message.message_id,
                    },
                });

            }

            return ctx.reply("Unexpected Error");
        });
    }

    botSendEarthquake(api: string | undefined) {
        this.command(commands.quake, async (ctx) => {
            try {
                let loadingMessage = await ctx.sendMessage("*Loading...*", { parse_mode: "Markdown" })
                if (api) {
                    const response = await fetch(api)
                    const data = await response.json()
                    const gempa = data.Infogempa?.gempa;

                    if (!gempa) {
                        return ctx.reply("❌ There is no earthquake data from BMKG at this time");
                    }
                    await ctx.deleteMessage(loadingMessage.message_id);
                    const sendData = this.formatGempaMessage(gempa);
                    const shakemapUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`;

                    return ctx.replyWithPhoto({ url: shakemapUrl }, { caption: sendData, parse_mode: "Markdown", reply_parameters: { message_id: ctx.message.message_id } });
                } else {
                    return ctx.reply(`API Not Available`)
                }

            } catch (e) {
                console.log(e);
                return ctx.reply(`Unexpected error: ${e}`)
            }
        })
    }

    botSendRandomNews(api: string | undefined) {
        this.command(commands.news, async (ctx) => {
            try {
                let loadingMessage = await ctx.sendMessage("*Loading...*", { parse_mode: "Markdown" })
                if (api) {
                    const response = await fetch(api)
                    const data = await response.json()
                    
                    for (const news of data.posts.slice(0, 5)) {
                        await ctx.replyWithPhoto(
                            { url: news.image },
                            {
                                caption: `*${news.title}* \n\n${news.headline}`,
                                parse_mode: "Markdown",
                                reply_parameters: { message_id: ctx.message.message_id },
                            }
                        );
                    }

                    await ctx.deleteMessage(loadingMessage.message_id);
                } else {
                    return ctx.reply(`API Not Available`)
                }

            } catch (e) {
                console.log(e);
                return ctx.reply(`Unexpected error: ${e}`)
            }
        })
    }

    botSendWeather(apiBase: string | undefined) {
        this.command(commands.weather, async (ctx) => {
            try {
                const input = ctx.message.text.split(" ");
                const locationKey = input[1]?.toLowerCase();

                if (!locationKey) {
                    return ctx.reply("❌ Please insert the location. Ex: `/weather bekasi`", { parse_mode: "Markdown" });
                }

                const kodeWilayah = helpers.weatherLocation[locationKey as keyof typeof helpers.weatherLocation];

                if (!kodeWilayah) {
                    return ctx.reply("⚠️ Location not found Use one of this: \n" +
                        Object.keys(helpers.weatherLocation).map(l => `- ${l}`).join("\n"),
                        { parse_mode: "Markdown" }
                    );
                }

                let loadingMessage = await ctx.sendMessage("*Loading...*", { parse_mode: "Markdown" });

                if (apiBase) {
                    const apiUrl = `${apiBase}?adm4=${kodeWilayah}`;
                    const response = await fetch(apiUrl);
                    const weather = await response.json();
                    const { data } = weather;
                    const location = data[0].lokasi.kotkab;

                    await ctx.deleteMessage(loadingMessage.message_id);

                    for (let i = 0; i < data[0].cuaca.length; i++) {
                        const lastIndex = data[0].cuaca[i].length - 1;
                        const cuaca = data[0].cuaca[i][lastIndex];

                        const date = new Date(cuaca.local_datetime);
                        const formattedDate = date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        });

                        await ctx.sendMessage(
                            `*Weather ${location} (latest update)* \n\n` +
                            `*⌛ Date:* ${formattedDate}\n` +
                            `*🌦️ Weather condition:* ${cuaca.weather_desc}\n` +
                            `*🌡️ Temperature:* ${cuaca.t}°C\n` +
                            `*💧 Humidity:* ${cuaca.hu}%\n` +
                            `*💨 Wind speed:* ${cuaca.ws} (m/s) \n\n` +
                            `*Source: BMKG*`,
                            { parse_mode: "Markdown" }
                        );
                    }
                }

            } catch (e) {
                console.log(e);
                return ctx.reply(`Unexpected error: ${e}`);
            }
        });
    }

    private formatGempaMessage(gempa: any): string {
        return `*${gempa.Tanggal} ${gempa.Jam}*

${gempa.Wilayah} ${gempa.Potensi}

*📊 Magnitudo:* ${gempa.Magnitude}
*📉 Kedalaman:* ${gempa.Kedalaman}
*🌐 Koordinat:* ${gempa.Coordinates}

*Source: BMKG*`;
    }
}

export default Bot