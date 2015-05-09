module.exports = function(Backbone, MailBox, MailView, ItemView, UI) {
    return Backbone.View.extend({
        el: $("section#list"),
        view: $("#view"),
        find: function(criteria) { return MailBox.findWhere(criteria) },
        MailView: MailView,

        // The DOM events specific to an item.
        events: {
            'mousedown article'   	: "load"
        },

        initialize: function() {
            this.listenTo(MailBox, 'add', this.render);
            this.listenTo(MailBox, 'remove', this.reset);
            this.listenTo(MailBox, 'reset', this.reset);

            MailBox.fetch();
        },

        reset: function() {
            // Refresh element
            this.el = $("section#list");

            this.el.empty();
            this.addAll();
        },

        zero: function(append) {
            // Refresh element
            this.el = $("section#list");

            this.el.empty();
            if(append) this.el.append('<div class="zero">Ops, you have no emails here... <br> <a>How about sending an email to a friend?</a></div>')
        },

        addOne: function(mail) {
            // Refresh element
            this.el = $("section#list");

            var view = new ItemView({model: mail});

            if(!this.el.find('[data-eid="' + mail.get('eID') + '"]').length){
                var newElement = $(view.render().el);
                newElement.attr('data-eid',mail.get('eID'));

                // Extract date (from incoming and outbound messages)
                var parsedDate = (mail.get('stamp'))?mail.get('stamp').sent:mail.get('schedule').attempted;
                // Add better date parsing
                newElement.find('.date').text(moment(parsedDate).fromNow());

                this.el.prepend(newElement);
            }
        },

        addAll: function() {
            // Zero data design
            if(MailBox.length <= 0) return this.zero(true);
            else this.zero(false);

            MailBox.each(this.addOne, this);
        },

        toggleMailView: function(toggle){
            $('#App').toggleClass('isDisplayMail', !toggle);
        },

        load: function(e) { UI.load.apply(this, arguments); },

        render: function() { this.addAll() }

    });
}
