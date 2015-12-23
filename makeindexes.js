"use strict";
var fs = require("fs");
var path = require("path");
var paths = ['utils', 'tags', 'modules', 'modules/private', 'attributes'];

paths.forEach(function (path) {
	var index = [];
	fs.readdirSync('./src/' + path).filter(function (file) {
		return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.indexOf(".js") > 0);
	}).forEach(function (file) {
		var filecontent = fs.readFileSync('./src/' + path + '/' + file, {encoding: 'utf8'});
		var ExportName = file.split('.')[0];
		var c = filecontent.match(/export/g).length;
		if (c === 1) {
			ExportName = "export {default as " + ExportName + "} from './" + ExportName + "';";
		} else {
			ExportName = "export * from './" + ExportName + "';"
		}
		if (c !== 0) {
			index.push(ExportName);
		}
	});
	fs.writeFileSync('./src/' + path + '/index.js', index.join().replace(/,/g, '\n'), {encoding: 'utf8'});
});