var sqlite3 = require('sqlite3').verbose();
const path = require('path');

var db = new sqlite3.Database(path.resolve(__dirname, 'db'));


exports.init=function(){
    db.run("CREATE TABLE if not exists flags (uid INT, username TEXT, name TEXT, date INT, reason TEXT )");
}

exports.flagUser=function (uid, username, name, reason){
    
    var stmt = db.prepare("INSERT INTO flags VALUES (?, ?, ?, ?, ?)");
    stmt.run(uid, username, name, Date.now(), reason);
    stmt.finalize();

}

exports.getUserFlags = function (uid, cb){
    uid=Number(uid);
    
    db.all("SELECT username, name,date, reason FROM flags where uid="+uid, function(err, rows) {
        cb(rows, err)
    });
}


exports.getAllFlags = function (cb){
    db.all("SELECT username, name,date, reason FROM flags where 1", function(err, rows) {
        cb(rows, err)
    });
}


exports.clearUserFlags=function (uid, cb){
    var stmt = db.prepare("delete from flags where uid="+uid);
    stmt.run();
    stmt.finalize();
    
    cb(0,0)
}


exports.test = function (){
    db.serialize(function() {

        setup();

        flagUser(12,"@kez","kezi", "lollo");

        setTimeout(function(){
        console.log(getAllFlags())

        }, 1000);
        
    });
    //db.close();
}
