var https = require('https');

exports.init = function(token) {
    this.token = token;
    this.cmds = [];
    console.log("initializing", token);
};

var send = function(method, data) {
    return new Promise(function(resolve, reject) {
        var request = "?";
        for (var key in data) {
            if (!data.hasOwnProperty(key))
                continue;
            var obj = data[key];
            request += key + "=" + encodeURIComponent(obj) + "&";
        }
        var options = {
            host: 'api.telegram.org',
            path: '/bot' + exports.token + '/' + method + request
        };
        var callback = function(response) {
            var str = '';
            response.on('data', function(chunk) {
                str += chunk;
            });
            response.on('end', function() {
                resolve(JSON.parse(str));
            });
        };
        https.request(options, callback).end();
    });
};
exports.send = send;



exports.registerCmd = function(cmd, cb) {
    console.log("registrato comando", cmd);
    this.cmds.push({
        command: cmd,
        callback: cb,
        type: "user"
    });
};
exports.registerModeratorCmd = function(cmd, cb) {
    console.log("registrato comando privilegiato", cmd);
    this.cmds.push({
        command: cmd,
        callback: cb,
        type: "moderator"
    });
};
exports.registerAdminCmd = function(cmd, cb) {
    console.log("registrato comando admin", cmd);
    this.cmds.push({
        command: cmd,
        callback: cb,
        type: "administrator"
    });
};

exports.start = function(callback) {
  console.log("starting");
  var last_update = 0;

    function receive_updates(res) {
        res.result.forEach((upd) => {
          last_update = upd.update_id;
          
          callback(upd);

          if (typeof upd.message !== 'undefined' && typeof upd.message.text !== 'undefined') {

              exports.cmds.forEach((cmd)=>{
                if (upd.message.text.substring(0, cmd.command.length) == cmd.command) {
                    if (upd.message.from.id == 56362895 || upd.message.from.id == 231705046) { // xxx
                        cmd.callback(upd.message);
                        return;
                    }

                    if (cmd.type === "user") {
                        cmd.callback(upd.message);
                    } else if (cmd.type === "moderator") {
                        console.log("moderator command called ", cmd);
                        send('getChatMember', {
                            chat_id: upd.message.chat.id,
                            user_id: upd.message.from.id
                        }).then(function(res) {
                            if (res.result.status == "administrator" || res.result.status == "creator") {
                                cmd.callback(upd.message);
                            }
                        }).catch((err)=>{ console.log(err) });
                    }
                }
              })
          }
        })

        send('getUpdates', {
            offset: last_update + 1,
            timeout: 100,

        }).then(receive_updates)
        .catch((err)=>{ console.log(err) });
    }


    send('getUpdates', {

    }).then(receive_updates)
    .catch((err)=>{ console.log(err) });
}
