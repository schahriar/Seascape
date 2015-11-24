var express = require('express');
var path = require('path');
var fs = require('fs');
var path = require('path');

module.exports = {
    name: "Seascape",
    extends: "frontend",
    defaults: {
        port: 2095,
        api: 'http://localhost:3080/'
    },
    exec: function(home, callback) {
        var context = this;
        var express = require('express');
        var app = express();
        
        app.get('/GETAPIURL', function(req, res) {
           res.json({ url: context.config.api });
        });
        
        app.use(express.static(__dirname + "/dist/"));

        // 404 error
        app.use(function(req, res, next) {
            res.status(404).end('404 - Not Found!');
        });

        app.listen(this.config.port);
    }
};
