var express = require('express');
var router = express.Router();
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var settings = require('../modules/settings.js');
var dburl = settings.get("mongodb_url");

router.get('/', function(req, res, next) {
    var output = "";
    var url = require('url');
    var q = url.parse(req.url, true).query;
    var request_uuid = q.file;
    MongoClient.connect(dburl, function(err, db) {
        if (err) throw err;
        var dbo = db.db(settings.get("mongodb_db"));
        var query = {
            _id: request_uuid
        };
        dbo.collection(settings.get("mongodb_collection")).find(query).toArray(function(err, result) {
            if (err) throw err;
            if (result.length != 0) res.download(path.join(__dirname, '../uploads/' + result[0].xxhash), result[0].name);
            else res.send('Not found...');
        });
    });
});

module.exports = router;
