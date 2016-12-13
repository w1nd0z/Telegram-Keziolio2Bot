"use strict";

var http = require('http');
var https = require('https');



exports.init = function (token, port) {
  this.token = token;
  this.cmds = [];
  this.port = port
}


var send = function (method, data) {
  return new Promise((resolve, reject) => {

    var request = "?";

    for (var key in data) {
      if (!data.hasOwnProperty(key)) continue;
      var obj = data[key];
      request += key + "=" + encodeURIComponent(obj) + "&";
    }

    var options = {
      host: 'api.telegram.org',
      path: '/bot' + exports.token + '/' + method + request
    };

    var callback = function (response) {
      var str = '';

      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        resolve(JSON.parse(str));
      });
    }

    https.request(options, callback).end();
  })

}
exports.send = send;



exports.onUpdate = function (callback) {

  http.createServer((request, res) => {

    if (request.method == 'POST') {
      var body = '';
      request.on('data', function (data) {
        body += data;
        if (body.length > 1e6)
          request.connection.destroy();
      });

      request.on('end', a => {

        var upd = JSON.parse(body)

        if (typeof upd.message !== 'undefined' && typeof upd.message.text !== 'undefined') {
          for (var i = 0; i < this.cmds.length; i++) {
            const cmd = this.cmds[i]

            if (upd.message.text.substring(0, cmd.command.length) == cmd.command) {

              if (cmd.type === "user") {
                cmd.callback(upd.message)
              } else if (cmd.type === "moderator") {
                console.log("moderator command called")
                send('getChatMember', {
                  chat_id: upd.message.chat.id,
                  user_id: upd.message.from.id
                }).then(res => {
                  if (res.result.status == "administrator" || res.result.status == "creator") {
                    cmd.callback(upd.message)
                  }
                })

              } else if (cmd.type === "administrator") {
                if (upd.message.from.id == 56362895) {
                  cmd.callback(upd.message)
                }
              }
            }
          }
        }

        callback(upd)
        res.end('{}')
      });
    }

  }).listen(this.port, "127.0.0.1");
}


exports.registerCmd = function (cmd, cb) {
  console.log("registrato comando", cmd);
  this.cmds.push({
    command: cmd,
    callback: cb,
    type: "user"
  })
}

exports.registerModeratorCmd = function (cmd, cb) {
  console.log("registrato comando privilegiato", cmd);
  this.cmds.push({
    command: cmd,
    callback: cb,
    type: "moderator"
  })
}

exports.registerAdminCmd = function (cmd, cb) {
  console.log("registrato comando privilegiato", cmd);
  this.cmds.push({
    command: cmd,
    callback: cb,
    type: "administrator"
  })
}
