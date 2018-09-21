var fs = require("fs");
var contents = fs.readFileSync("settings.json");

exports.getAll = function() {
  var jsonContent = JSON.parse(contents);
  return jsonContent;
}

exports.get = function(name) {
  var jsonContent = JSON.parse(contents);
  return jsonContent[name];
}
