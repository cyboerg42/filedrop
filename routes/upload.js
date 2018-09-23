var express = require('express');
var router = express.Router();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var XXHash = require('xxhash')
var MongoClient = require('mongodb').MongoClient;
var uuidv4 = require('uuid-random')
var settings = require('../modules/settings.js');
var dburl = settings.get("mongodb_url");

router.post('/', function(req, res, next) {
    let form = new formidable.IncomingForm();
    form.multiples = false;
    form.uploadDir = path.join(__dirname, '../uploads');
    form.on('file', function(field, file) {
        MongoClient.connect(dburl, function(err, db) {
            if (err) throw err;
            const c_uuid = uuidv4();
            const dbo = db.db(settings.get("mongodb_db"));
            const mongo_coll = settings.get("mongodb_collection");
            let query = {
                _id: c_uuid
            };
            dbo.collection(mongo_coll).find(query).toArray(function(err, result) {
                if (result.lenght != undefined) {
                    console.log(result.lenght + " DUP KEY catch!");
                    db.close();
                    res.end("ERROR - please try again!");
                }
                let filestream = fs.readFileSync(file.path),
                hash = XXHash.hash(filestream, 0xCAFEBABE);
                query = {
                    xxhash: hash
                };
                dbo.collection(mongo_coll).find(query).toArray(function(err, result) {
                    if (err) throw err;
                    const original_name = file.name;
                    if (result.length == 0) {
                        const myobj = {
                            _id: c_uuid,
                            xxhash: hash,
                            name: original_name
                        };
                        dbo.collection(mongo_coll).insertOne(myobj, function(err, res) {
                            if (err) throw err;
                        });
                        db.close();
                        file.name = hash.toString();
                        fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
                            if (err) throw err;
                        });
                        res.end('<a href="/download?file=' + c_uuid + '"><font color="white">DOWNLOAD</font></a>');
                    } else {
                        db.close();
                        c_uuid = result[0]._id;
                        res.end('<a href="/download?file=' + c_uuid + '"><font color="white">DOWNLOAD</font></a>');
                        fs.unlink(file.path, function(err) {
                            if (err) throw err;
                        });
                    }
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
