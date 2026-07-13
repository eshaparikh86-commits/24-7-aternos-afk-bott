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

    bot.once("login", () => {
        console.log("Connected to Minecraft.");
    });

    bot.once("spawn", () => {
        console.log("Spawned successfully.");

        // Register (ignored if already registered)
        setTimeout(() => {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        }, 3000);

        // Login
        setTimeout(() => {
            bot.chat(`/login ${PASSWORD}`);
        }, 6000);

        console.log("AFK mode started.");

        // Tiny camera movement every 2 minutes
        setInterval(() => {
            if (!bot.entity) return;

            const yaw = bot.entity.yaw + 0.15;
            const pitch = bot.entity.pitch;

            bot.look(yaw, pitch, true);

            console.log("Anti-AFK look.");
        }, 120000);
    });

    bot.on("messagestr", (message) => {
        console.log(message);

        const msg = message.toLowerCase();

        if (msg.includes("register")) {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        }

        if (msg.includes("login")) {
            bot.chat(`/login ${PASSWORD}`);
        }

        if (msg.includes("successfully logged")) {
            console.log("Login successful.");
        }

        if (msg.includes("successfully registered")) {
            console.log("Registration successful.");
        }
    });

    bot.on("kicked", (reason) => {
        console.log("Kicked:", reason);
    });

    bot.on("error", (err) => {
        console.error("Bot Error:", err);
    });

    bot.on("end", () => {
        console.log("Disconnected. Reconnecting in 5 seconds...");
        setTimeout(createBot, 5000);
    });
}

createBot();
