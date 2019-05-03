require('dotenv').config()
const login = require('facebook-chat-api');

// Create simple echo bot
login({ email: process.env.FB_USER, password: process.env.FB_PASS }, (err, api) => {
    if (err) return console.error(err);
    api.listen((err, message) => {
        api.sendMessage(message.body, message.threadID);
    });
});
