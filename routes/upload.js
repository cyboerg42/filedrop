var express = require('express');
var router = express.Router();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var XXHash = require('xxhash')
var MongoClient = require('mongodb').MongoClient;
const uuidv4 = require('uuid/v4')
var settings = require('../modules/settings.js');
var dburl = settings.get("mongodb_url");
var c_uuid;

router.post('/', function(req, res, next) {
    c_uuid = uuidv4();
    var form = new formidable.IncomingForm();
    form.multiples = false;
    form.uploadDir = path.join(__dirname, '../uploads');
    form.on('file', function(field, file) {
        MongoClient.connect(dburl, function(err, db) {
            if (err) throw err;
            var dbo = db.db(settings.get("mongodb_db"));
            var query = {
                _id: c_uuid
            };
            dbo.collection(settings.get("mongodb_collection")).find(query).toArray(function(err, result) {
                if (result.lenght != 0) c_uuid = uuidv4();
                var filestream = fs.readFileSync(file.path),
                hash = XXHash.hash(filestream, 0xCAFEBABE);
                MongoClient.connect(dburl, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db(settings.get("mongodb_db"));
                    var query = {
                        xxhash: hash
                    };
                    dbo.collection(settings.get("mongodb_collection")).find(query).toArray(function(err, result) {
                        if (err) throw err;
                        var r_l = result.length;
                        var original_name = file.name;
                        db.close();
                        if (r_l == 0) {
                            MongoClient.connect(dburl, function(err, db) {
                                if (err) throw err;
                                var dbo = db.db(settings.get("mongodb_db"));
                                var myobj = {
                                    _id: c_uuid,
                                    xxhash: hash,
                                    name: original_name
                                };
                                dbo.collection(settings.get("mongodb_collection")).insertOne(myobj, function(err, res) {
                                    if (err) throw err;
                                    db.close();
                                });
                            });
                            file.name = hash.toString();
                            fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
                                if (err) throw err;
                            });
                            res.end('<a href="/download?file=' + c_uuid + '"><font color="white">DOWNLOAD</font></a>');
                        } else {
                            c_uuid = result[0]._id;
                            res.end('<a href="/download?file=' + c_uuid + '"><font color="white">DOWNLOAD</font></a>');
                            fs.unlink(file.path, function(err) {
                                if (err) return console.log(err);
                            });
                        }
                    });
                });
            });
        });
    });
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });
    form.parse(req);
});

module.exports = router;
