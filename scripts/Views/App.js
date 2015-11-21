var rClasses = ['green','blue','cyan','orange','red','yellow'];

module.exports = function(Backbone, MailBox, Composer, UI, access) {
    return Backbone.View.extend({
        el: $("body"),

        // The DOM events specific to an item.
        events: {
            'click button[data-page]'	: "page",
            'click [data-folder]'		: "folder",
            'click [data-action]'		: "action"
        },

        templates: {
            stats: _.template('Showing page <%- page %> out of <%- Math.ceil(pages) %>'),
            composer: _.template('<div id="<%- id %>" class="_full <%- color %>"></div>')
        },

        initialize: function() {
            this.listenTo(MailBox, 'all', this.render);
            this.fit();
            setInterval(this.fit, 1000);
        },

        // Render statistics and buttons
        render: function(e) {
            $('#stats').empty().append(this.templates.stats(stats));
        },

        fit: function() {
            $('.full-height').css({ height: $(window).height() - $('nav').outerHeight(true) });
        },

        page: function(e) {
            var element = $(e.currentTarget);
            var attr = element.attr('data-page');
            var to = 1;

            // Check if we are at the last page
            if((stats.page >= Math.ceil(stats.pages))&&(attr === 'next')) return null;
            // Check if we are at the first page
            if((stats.page <= 1)&&(attr === 'prev')) return null;

            if(!attr) return null;
            if(attr.constructor === Number)
                to = parseInt(attr);

                else if(attr === 'next') to = ++stats.page;
                else if(attr === 'prev') to = (stats.page > 1)?--stats.page:stats.page;

                // Fetch
                MailBox.fetch({ data: { page: to, folder: stats.folder }, reset: true });
        },

        folder: function(e) {
            var element = $(e.currentTarget);
            var attr = element.attr('data-folder');
            // Remove prev active
            element.parent().find('.active').removeClass('active');
            // Add active to current
            element.addClass('active');

            // Reset current page in stats
            stats.page = 1;
            stats.folder = attr;

            // Fetch
            MailBox.fetch({ data: { folder: attr, page: stats.page }, reset: true });
        },

        action: function(e) {
            var element = $(e.currentTarget);
            var action = element.attr('data-action');

            // Logout action
            if(action === 'logout') {
                access.logout(function(result){
                    if(result.success) alert("successfully logged out!");
                    window.location.reload();
                });
            }

            // Change password action
            if(action === 'changepassword') {
                access.changePassword(prompt("Please type your CURRENT password:"), prompt("Please type your NEW password:"), prompt("Please CONFIRM your NEW password:"), function(result){
                    if(result.error) return alert(result.error);
                    if(result.success) alert("successfully changed password!");
                    window.location.reload();
                });
            }

            // List action
            if(action === 'list') $('.isDisplayMail').removeClass('isDisplayMail');

            // Compose action -> creates a new composer panel
            if(action === 'compose') {
                if($('#composer').children().length >= 4) return alert("Maximum number of open compose panels reached!");

                var id = _.uniqueId('composer_');
                var color = Math.floor(Math.random() * rClasses.length);
                var el = $(this.templates.composer({ id: id, color: rClasses[color] }));
                rClasses.splice(color, 1);
                el.click(function(){
                    if(!$(this).is(':first-child'))$(this).prependTo($(this).parent());
                });
                $('#composer').prepend(el);
                var composer = new Composer({ el: $('#' + id) });
            }

            // MarkAs functions -> mark the current email/selection with given attribute
            if (action.split('-')[0] === 'markAs') {
                var change = {};
                change[action.split('-')[1]] = true;
                if($('#App').is('.isDisplayMail')) {
                    var mail = MailBox.findWhere({ 'eID': $(this.el).find('#view > section').attr('data-eid') });
                    mail.markAs(change);
                    MailBox.remove(mail);
                }else{
                    _.each(MailBox.where({ selected: true }), function(mail) {
                        mail.markAs(change);
                        MailBox.remove(mail);
                    });
                }
            }
        }
    });
};