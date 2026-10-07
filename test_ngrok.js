require('dotenv').config();
const ngrok = require('@ngrok/ngrok');

(async function() {
    const listener = await ngrok.forward({ addr: 9000, authtoken: process.env.NGROK_AUTHTOKEN });
    console.log("DOMAIN:" + listener.url());
    process.exit(0);
})();
