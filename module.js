var express = require('express');
var path = require('path');
var fs = require('fs');

var files = [
    "./dist/bundle.js",
    "./dist/style.css",
    "./index.html"
]

module.exports = {
    name: "Seascape",
    extends: "frontend",
    version: "1.2.0",
    defaults: {
        port: 2095
    },
    exec: function(){
        console.log("SEASCAPE STARTED");
        console.log("ARGUMENTS", '\n', arguments, '\n');
        console.log("CONTEXT", '\n', this, '\n');
        /*
        files.forEach(function(file, index) {
            fs.exists(fileName, function (exists) {
            }
        })
        */
    }
}
