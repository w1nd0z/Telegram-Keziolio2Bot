var fs = require("fs");

var bot = require("./kbot.js");
var iata = require("./iata.js");


iata.init();

var exec = require('child_process').exec;


console.log("Avvio...");


var tkn = fs.readFileSync(path.resolve(__dirname, 'token'), 'utf8');

bot.init(tkn.trim());



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
    
    bot.send('deleteMessage', {
      chat_id: mess.chat.id,
      message_id: mess.message_id
    }, res => {})
    
  }
})




bot.registerCmd("s", (mess) => {


  if (typeof mess.reply_to_message === "undefined")
    return;


  if (typeof mess.reply_to_message.text !== "string")
    return;

  var string = mess.text;
  var n = 0;

  for (var i = 0; i < string.length; i++) {
    if (string[i] === "/")
      n++;
  }

  if (n < 3)
    return;

  bot.send('sendMessage', {
    chat_id: mess.chat.id,
    text: mess.reply_to_message.text.replace(string.substr(1).split("/")[1], string.substr(1).split("/")[2]) + "*"
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


bot.registerModeratorCmd("!id", (mess) => {
  bot.send('sendMessage', {
    chat_id: mess.chat.id,
    text: mess.reply_to_message.from.id
  })
})


bot.registerModeratorCmd("!gid", (mess) => {
  bot.send('sendMessage', {
    chat_id: mess.chat.id,
    text: mess.chat.id
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
    }).then((upd)=>{
        if(upd.ok)
            bot.send('sendMessage', {
                chat_id: mess.chat.id,
                text: mess.reply_to_message.from.first_name + ' è stato terminato.'
            })
        else
            bot.send('sendMessage', {
                chat_id: mess.chat.id,
                text: mess.reply_to_message.from.first_name + ' non è stato terminato.\n' + upd.description
            })    
    })



  }, 1000);
})


bot.registerModeratorCmd("/debug", (mess) => {
    bot.send('sendMessage', {
      chat_id: mess.chat.id,
      text: JSON.stringify(mess.reply_to_message)
    })
})



/*
 *  ADMIN COMMANDS
 */

bot.registerAdminCmd("/flag", (mess) => {
    
    reason = mess.text.substring(6);
    if(reason.length == 0)
        return;
    
    if(!mess.reply_to_message)
        return;
    
    iata.flagUser(mess.reply_to_message.from.id, mess.reply_to_message.from.username, mess.reply_to_message.from.first_name + " " + mess.reply_to_message.from.last_name, reason);
     
    bot.send('sendMessage', {
      chat_id: mess.chat.id,
      text: "k",
    }, res => {})

 })
 




function printFlags(user, chatid){
    iata.getUserFlags(user.id, (rows, err) => {
        
        if(rows.length==0)
            return;
                
        message="Segnalazioni dell'utente @"+ user.username + " (" + user.id + ")\n\n" ;
        
        for (row in rows){
            message+=" - " + rows[row].reason+"\n";
        }
        
        bot.send('sendMessage', {
            chat_id: chatid,
            text: message,
        }, res => {})
    })
}


bot.registerAdminCmd("/getflags", (mess) => {

    if(!mess.reply_to_message)
        return;
        
    printFlags(mess.reply_to_message.from,mess.chat.id)
    
 })
 
  
bot.registerAdminCmd("/getallflags", (mess) => {
     
    iata.getAllFlags((rows, err) => {
                
        message="";
        
        for (row in rows){
            message+="@"+rows[row].username+" "+rows[row].reason+"\n";
        }
        
        bot.send('sendMessage', {
        chat_id: mess.chat.id,
        text: message,
        }, res => {})
    })

 })
 
 bot.registerAdminCmd("/clearflags", (mess) => {

    iata.clearUserFlags(mess.reply_to_message.from.id, (rows, err) => {

        bot.send('sendMessage', {
        chat_id: mess.chat.id,
        text: "k",
        }, res => {})
    })
 })
 


 bot.registerAdminCmd("!gtfo", (mess) => {
     bot.send('leaveChat', {
       chat_id: mess.chat.id,
     }, res => {})
 })


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



bot.start((upd) =>{
    if(upd.message.new_chat_members){
        upd.message.new_chat_members.forEach((member)=>{
            printFlags(member, upd.message.chat.id)
        })
        return;
    }
    
    //fuck ignoranza fork
    if(upd.message.forward_from_chat && upd.message.forward_from_chat.id == -1001056774476){ 
        bot.send('deleteMessage', {
        chat_id: upd.message.chat.id,
        message_id: upd.message.message_id
        }, res => {})
        return;
    }
    if(upd.message.text.toLowerCase().indexOf("@ignuranzafork") !== -1 ||upd.message.text.toLowerCase().indexOf("t.me/ignuranzafork") !== -1 ){
        bot.send('deleteMessage', {
        chat_id: upd.message.chat.id,
        message_id: upd.message.message_id
        }, res => {})
        return;
    }
    
    
    
});
