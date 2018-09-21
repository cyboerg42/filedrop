var express = require('express');
var app = express();
var path = require('path');

var download = require('./routes/download');
var upload = require('./routes/upload');
var index = require('./routes/index');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/download', download);
app.use('/upload', upload);

var server = app.listen(8081, function() {
    console.log('Server listening on port 8081');
});
