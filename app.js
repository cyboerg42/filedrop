var express = require('express');
var app = express();
var path = require('path');

var download = require('./routes/download');
var upload = require('./routes/upload');
var index = require('./routes/index');
var settings = require('./modules/settings.js');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/download', download);
app.use('/upload', upload);

var server = app.listen(settings.get("http_port"), function() {
    console.log('Server listening on port ' + settings.get("http_port"));
});
