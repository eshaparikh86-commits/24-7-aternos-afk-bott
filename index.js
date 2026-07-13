process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const mineflayer = require("mineflayer");
require("./keep_alive");

const HOST = process.env.IP;
const PORT = Number(process.env.MC_PORT) || 25565;
const USERNAME = process.env.NAME;
const PASSWORD = process.env.PASSWORD;

function createBot() {
    console.log(`Connecting to ${HOST}:${PORT}`);

    const bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: USERNAME
    });

    bot.on("login", () => {
        console.log("Connected to server.");
    });

    bot.on("spawn", () => {
        console.log("Spawned.");

        // Register if needed
        setTimeout(() => {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        }, 3000);

        // Login
        setTimeout(() => {
            bot.chat(`/login ${PASSWORD}`);
        }, 6000);

        console.log("Waiting in AFK chamber...");
    });

    bot.on("messagestr", (msg) => {
        console.log(msg);

        const text = msg.toLowerCase();

        if (text.includes("register")) {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        }

        if (text.includes("login")) {
            bot.chat(`/login ${PASSWORD}`);
        }
    });

    bot.on("kicked", (reason) => {
        console.log("Kicked:", reason);
    });

    bot.on("error", (err) => {
        console.log("Error:", err);
    });

    bot.on("end", () => {
        console.log("Disconnected. Reconnecting in 5 seconds...");
        setTimeout(createBot, 5000);
    });
}

createBot();
