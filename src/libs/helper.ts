const helperText = `*👋 Hello, welcome to this Bot!*
I’m here to help you with the available features.
Use the commands below to get started:

*📌 Available Commands:*
/start - Start the bot and show the welcome message
/news - Get the latest news
/quake - Get information about the latest earthquake
/weather {location} - Get spesific weather information from your location`;

const weatherLocation = {
    jakarta: "31.71.03.1001",
    bandung: "32.73.03.1001",
    bekasi: "32.75.03.1001",
    bogor: "32.71.03.1001",
    yogyakarta: "34.71.03.1001",
}

export default {helperText, weatherLocation}