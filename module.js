var express = require('express');
var path = require('path');
var fs = require('fs');
var path = require('path');

var files = [{
    url: 'dist/bundle.js',
    path: "./dist/bundle.js"
}, {
    url: 'dist/style.css',
    path: "./dist/style.css"
}, {
    url: 'index.html',
    path: "./index.html"
}]



module.exports = {
    name: "Seascape",
    extends: "frontend",
    version: "1.2.0",
    defaults: {
        port: 2095
    },
    exec: function(home, callback) {
        var express = require('express');
        var app = express();

        files.forEach(function(file, index) {
            app.get(file.url, function(req, res) {
                res.sendFile(file.path, {
                    dotfiles: 'deny',
                    headers: {
                        'x-timestamp': Date.now(),
                        'x-sent': true
                    }
                }, function(error) {
                    if (error) {
                        console.log(error);
                        res.status(error.status).end();
                    } else {
                        console.log('Sent:', file.path);
                    }
                });
            });
        })

        // 404 error
        app.use(function(req, res, next) {
            res.status(404).end('404 - Not Found!');
        })

        app.listen(this.config.port);
    }
}
