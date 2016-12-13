"use strict";


var fs = require("fs");

var bot = require("./kbot.js");
var exec = require('child_process').exec;


console.log("Avvio...");

function logger(up) {
  if (typeof up.message != 'undefined') {
    function log( /**/ ) {
      var args = arguments;
      var data = "";
      for (var i = 0; i < args.length; i++) {
        data += args[i] + "\t";
      }
      fs.appendFile('logs/' + up.message.chat.id + '.log', data + "\n", function (err) {});
    }

    if (typeof up.message.text != 'undefined') {
      log("message", up.message.date, up.message.from.id, up.message.from.first_name, up.message.text);
    } else if (typeof up.message.sticker != 'undefined') {
      log("sticker", up.message.date, up.message.from.id, up.message.from.first_name, up.message.sticker.emoji);
    } else if (typeof up.message.photo != 'undefined') {
      log("photo", up.message.date, up.message.from.id, up.message.from.first_name);
    }
  }
}


bot.init(process.argv[2], 3002);


bot.registerCmd("/part", (mess) => {
  bot.send('kickChatMember', {
      chat_id: mess.chat.id,
      user_id: mess.from.id
    })
    .then(res => {
      setTimeout(() => {
        bot.send('unbanChatMember', {
          chat_id: mess.chat.id,
          user_id: mess.from.id
        })
      }, 500);
    })
})


bot.registerCmd("/me", (mess) => {
  if (mess.text.substring(4).length) {
    bot.send('sendMessage', {
      chat_id: mess.chat.id,
      text: "-*- " + mess.from.first_name + " " + mess.text.substring(4)
    }, res => {})
  }
})


bot.registerCmd("!libri", (mess) => {
  bot.send('sendMessage', {
    chat_id: mess.chat.id,
    text: `
https://en.wikibooks.org/wiki/X86_Assembly
https://en.wikibooks.org/wiki/C_Programming
https://en.wikibooks.org/wiki/C%2B%2B_Programming
http://www.ioprogrammo.it/index.php?topic=14799.0
https://duckduckgo.com/?q=Effective+Modern+C%2B%2B
`
  })
})


/*
 * MODERATOR COMMANDS
 */

bot.registerModeratorCmd("ping", (mess) => {
  bot.send('sendMessage', {
    chat_id: mess.chat.id,
    text: "pong"
  })
})


bot.registerModeratorCmd("/kick", (mess) => {
  setTimeout(() => {
    bot.send('kickChatMember', {
        chat_id: mess.chat.id,
        user_id: mess.reply_to_message.from.id
      })
      .then(res => {
        setTimeout(() => {
          bot.send('unbanChatMember', {
            chat_id: mess.chat.id,
            user_id: mess.reply_to_message.from.id
          })
        }, 500);

      })
  }, 1000);
})


bot.registerModeratorCmd("/ban", (mess) => {
  setTimeout(function () {
    bot.send('kickChatMember', {
      chat_id: mess.chat.id,
      user_id: mess.reply_to_message.from.id
    })

    bot.send('sendMessage', {
      chat_id: mess.chat.id,
      text: mess.reply_to_message.from.first_name + ' è stato terminato.'
    })

  }, 1000);
})


/*
 *  ADMIN COMMANDS
 */


bot.registerAdminCmd("$", (mess) => {
  exec(mess.text.substring(1), function callback(error, stdout, stderr) {
    bot.send('sendMessage', {
      chat_id: mess.chat.id,
      text: stdout + stderr,
    }, res => {})
  });
})


bot.registerAdminCmd("!cc", (mess) => {

  var headers = `#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdio_ext.h>
#include <memory.h>
#include <time.h>
#include <utime.h>
#include <errno.h>
#include <stdbool.h>
#include <signal.h>
#include <unistd.h>
#include <pwd.h>
#include <fcntl.h>
#include <dirent.h>
#include <sys/time.h>
#include <sys/stat.h>
#include <sys/resource.h>
#include <sys/ioctl.h>
#include <sys/types.h>
#include <linux/input.h>
#include <math.h>`;

  if (typeof mess.reply_to_message.text !== undefined) {

    var text = mess.reply_to_message.text;

    fs.writeFile("/tmp/file.c", headers + "\n  int main(){\n " + text + " \n }\n", function (err) {
      if (err) {
        return console.log(err);
      }
    });

    exec("gcc -o /tmp/lol /tmp/file.c  && /tmp/lol", function callback(error, stdout, stderr) {
      bot.send('sendMessage', {
        chat_id: mess.chat.id,
        text: "" + stderr + stdout + "",
        parse_mode: "Markdown",
      }, res => {
        console.log(res)
      })
    });
  }
});


bot.onUpdate(function (up) {
  logger(up)
})
