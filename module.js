var express = require('express');
var path = require('path');
var fs = require('fs');
var path = require('path');

var files = [{
    url: '/dist/bundle.js',
    path: "bundle.js"
}, {
    url: '/dist/style.css',
    path: "style.css"
}, {
    url: '/home',
    path: "index.html"
}, {
    url: '/',
    path: "index.html"
}, {
    url: '/logo-mini.png',
    path: "logo-mini.png"
}, {
    url: '/logo-white.png',
    path: "logo-white.png"
}, {
    url: '/logo.png',
    path: "logo.png"
}]



module.exports = {
    name: "Seascape",
    extends: "frontend",
    defaults: {
        port: 2095,
        api: 'http://localhost:3080/'
    },
    exec: function(home, callback) {
        var express = require('express');
        var app = express();

        files.forEach(function(file, index) {
            app.use(file.url, function(req, res) {
                res.sendFile(file.path, {
                    root: __dirname + "/dist/",
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
                        console.log('SEASCAPE [SENT]:', file.path);
                    }
                });
            });
        });
        
        app.use('/GETAPIURL', function(req, res) {
           res.json({ url: this.config.api });
        });

        // 404 error
        app.use(function(req, res, next) {
            res.status(404).end('404 - Not Found!');
        });

        app.listen(this.config.port);
    }
};
