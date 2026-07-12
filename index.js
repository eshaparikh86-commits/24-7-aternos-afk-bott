const mineflayer = require('mineflayer');
const fs = require('fs');
const { keep_alive } = require("./keep_alive");

let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

var lasttime = -1;
var moving = 0;
var connected = 0;

var actions = ['forward', 'back', 'left', 'right'];
var lastaction;
var pi = Math.PI;

var moveinterval = 2;
var maxrandom = 5;

const host = data.ip;
const username = data.name;
const password = data.password; // Add password in config.json

const bot = mineflayer.createBot({
    host: host,
    username: username
});

bot.on('login', () => {
    console.log("Logged In");
});

bot.on('spawn', () => {
    connected = 1;

    // Wait a few seconds before sending auth commands
    setTimeout(() => {
        bot.chat(`/register ${password} ${password}`);
    }, 3000);

    setTimeout(() => {
        bot.chat(`/login ${password}`);
    }, 6000);
});

bot.on('messagestr', (message) => {
    console.log(message);

    const msg = message.toLowerCase();

    if (msg.includes("register")) {
        bot.chat(`/register ${password} ${password}`);
    }

    if (msg.includes("login")) {
        bot.chat(`/login ${password}`);
    }
});

bot.on('time', function () {
    if (connected < 1) return;

    if (lasttime < 0) {
        lasttime = bot.time.age;
    } else {
        var randomadd = Math.random() * maxrandom * 20;
        var interval = moveinterval * 20 + randomadd;

        if (bot.time.age - lasttime > interval) {
            if (moving) {
                bot.setControlState(lastaction, false);
                moving = 0;
            } else {
                var yaw = Math.random() * pi - (0.5 * pi);
                var pitch = Math.random() * pi - (0.5 * pi);

                bot.look(yaw, pitch, false);

                lastaction = actions[Math.floor(Math.random() * actions.length)];
                bot.setControlState(lastaction, true);

                moving = 1;
                bot.activateItem();
            }

            lasttime = bot.time.age;
        }
    }
});

bot.on('error', console.log);
bot.on('end', () => {
    console.log("Disconnected from server.");
});
