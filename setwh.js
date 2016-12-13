var bot = require("./kbot.js");

bot.init(process.argv[2], 3002);


bot.send('setWebhook', {
  url: process.argv[3],
})
.then((r)=>{ console.log(r) })
