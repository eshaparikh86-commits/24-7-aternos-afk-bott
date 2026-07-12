process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});

const mineflayer = require("mineflayer");
require("./keep_alive");

// ===== Railway Environment Variables =====
const host = process.env.IP;
const username = process.env.NAME;
const password = process.env.PASSWORD;

// ===== Movement Variables =====
let lasttime = -1;
let moving = false;
let connected = false;

const actions = ["forward", "back", "left", "right"];
let lastaction;

const moveinterval = 2;
const maxrandom = 5;

function createBot() {
    console.log("Connecting...");

    const bot = mineflayer.createBot({
        host,
        username
    });

    bot.on("login", () => {
        console.log("Logged In");
    });

    bot.on("spawn", () => {
        console.log("Spawned");
        connected = true;

        setTimeout(() => {
            bot.chat(`/register ${password} ${password}`);
        }, 3000);

        setTimeout(() => {
            bot.chat(`/login ${password}`);
        }, 6000);
    });

    bot.on("messagestr", (message) => {
        console.log(message);

        const msg = message.toLowerCase();

        if (msg.includes("register")) {
            bot.chat(`/register ${password} ${password}`);
        }

        if (msg.includes("login")) {
            bot.chat(`/login ${password}`);
        }
    });

    bot.on("time", () => {
        if (!connected) return;

        if (lasttime < 0) {
            lasttime = bot.time.age;
            return;
        }

        const interval = moveinterval * 20 + Math.random() * maxrandom * 20;

        if (bot.time.age - lasttime > interval) {

            if (moving) {
                bot.setControlState(lastaction, false);
                moving = false;
            } else {

                const yaw = (Math.random() - 0.5) * Math.PI;
                const pitch = (Math.random() - 0.5) * Math.PI;

                bot.look(yaw, pitch, true);

                lastaction = actions[Math.floor(Math.random() * actions.length)];

                bot.setControlState(lastaction, true);

                moving = true;

                bot.activateItem();
            }

            lasttime = bot.time.age;
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
        connected = false;
        lasttime = -1;

        setTimeout(createBot, 5000);
    });
}

createBot();
