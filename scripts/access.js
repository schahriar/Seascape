var $ = require('jquery');

var access = {
    get: function(callback) {
        $.get("/api/access/check", function(data) {
            callback(data.authenticated || false);
        }, "json");
    },
    check: function(callback) {
        this.get(function(auth){
            if(auth) return callback(true);
            else return callback(false);
        })
    },
    request: function(email, password, callback) {
        $.ajaxSetup({async:true});
        $.post("/api/access/login", {
                email: email,
                password: password
            }, "json")
            .done(function(data) {
                callback(data)
            });
    },
    logout: function(callback) {
        $.post("/api/access/logout", null, "json").done(function(data) {
            callback(data)
        });
    },
    changePassword: function(currentPassword, newPassword, confirmPassword, callback) {

        // Confirm password function
        if(newPassword !== confirmPassword) return callback({ error: "New password does not match its confirmation." });

        $.post("/api/access/changePassword", {
            cpassword: currentPassword,
            password: newPassword
        }, "json").done(function(data) {
            callback(data)
        });
    }
}

module.exports = access;
