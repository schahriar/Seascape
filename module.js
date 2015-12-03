var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var g_config = {};

module.exports = {
    name: "Seascape",
    extends: "frontend",
    defaults: {
        port: 2095,
        api: 'http://localhost:3080/'
    },
    exec: function(home, callback) {
        g_config = this.config;
        
        app.get('/GETAPIURL', function(req, res) {
           res.json({ url: g_config.api });
        });
        
        app.use(express.static(__dirname + "/dist/"));

        // 404 error
        app.use(function(req, res, next) {
            res.status(404).end('404 - Not Found!');
        });

        app.listen(g_config.port);
    },
    update: function(config) {
        if((!config) || (typeof config !== 'object')) return;
        g_config = config;
        
        // Reset Port
        app.close();
        app.listen(g_config.port);
    }
};
