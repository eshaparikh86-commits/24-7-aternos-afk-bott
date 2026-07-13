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
        console.log("Logged into server.");
    });

    bot.on("spawn", () => {
        console.log("Spawned.");

        // Register (ignored if already registered)
        setTimeout(() => {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        }, 3000);

        // Login
        setTimeout(() => {
            bot.chat(`/login ${PASSWORD}`);
        }, 6000);

        // Start anti-AFK after login
        setTimeout(() => {
            startAntiAFK(bot);
        }, 10000);
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
        console.log("Error:", err.message);
    });

    bot.on("end", () => {
        console.log("Disconnected. Reconnecting in 5 seconds...");
        setTimeout(createBot, 5000);
    });

    return bot;
}

function startAntiAFK(bot) {

    const actions = ["forward", "back", "left", "right"];

    setInterval(() => {

        if (!bot.entity) return;

        const action = actions[Math.floor(Math.random() * actions.length)];

        // Random look direction
        bot.look(
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * Math.PI / 2,
            true
        );

        // Start moving
        bot.setControlState(action, true);

        // Jump
        bot.setControlState("jump", true);

        // Swing arm
        bot.swingArm();

        // Use held item if available
        try {
            bot.activateItem();
        } catch (e) {}

        console.log("Anti-AFK action:", action);

        // Stop after 2 seconds
        setTimeout(() => {
            bot.setControlState(action, false);
            bot.setControlState("jump", false);
        }, 2000);

    }, 7000);

    // Show position every 15 seconds
    setInterval(() => {
        if (bot.entity) {
            console.log("Position:", bot.entity.position);
        }
    }, 15000);
}

createBot();
