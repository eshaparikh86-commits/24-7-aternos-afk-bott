process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const mineflayer = require("mineflayer");
require("./keep_alive");

const HOST = process.env.IP;
const PORT = Number(process.env.MC_PORT) || 25565;
const USERNAME = process.env.NAME;
const PASSWORD = process.env.PASSWORD;

let bot;

function createBot() {
    console.log("Connecting to:", HOST + ":" + PORT);

    bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: USERNAME
    });

    let connected = false;
    let moving = false;
    let lastTime = -1;
    let lastAction = "";

    const actions = ["forward", "back", "left", "right"];

    bot.on("login", () => {
        console.log("Logged In");
    });

    bot.on("spawn", () => {
        console.log("Spawned");
        connected = true;

        setTimeout(() => {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        }, 3000);

        setTimeout(() => {
            bot.chat(`/login ${PASSWORD}`);
        }, 6000);
    });

    bot.on("messagestr", (msg) => {
        console.log(msg);

        const m = msg.toLowerCase();

        if (m.includes("register")) {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        }

        if (m.includes("login")) {
            bot.chat(`/login ${PASSWORD}`);
        }
    });

    bot.on("time", () => {
        if (!connected) return;

        if (lastTime < 0) {
            lastTime = bot.time.age;
            return;
        }

        const interval = 40 + Math.random() * 100;

        if (bot.time.age - lastTime > interval) {

            if (moving) {

                bot.setControlState(lastAction, false);
                moving = false;

            } else {

                const yaw = (Math.random() - 0.5) * Math.PI;
                const pitch = (Math.random() - 0.5) * Math.PI;

                bot.look(yaw, pitch, true);

                lastAction = actions[Math.floor(Math.random() * actions.length)];

                bot.setControlState(lastAction, true);

                moving = true;

                bot.activateItem();

            }

            lastTime = bot.time.age;
        }
    });

    bot.on("kicked", console.log);

    bot.on("error", (err) => {
        console.log("Error:", err.message);
    });

    bot.on("end", () => {
        console.log("Disconnected. Reconnecting in 5 seconds...");
        setTimeout(createBot, 5000);
    });
}

createBot();
