module.exports = function(Backbone) {
    return Backbone.View.extend({
        tagName:  "article",

        template: _.template($('#template-list-item').html()),

            initialize: function() {
                this.listenTo(this.model, 'change', this.render);
                //this.listenTo(this.model, 'destroy', this.remove);
                this.$el.slideDown();
            },

            render: function() {
                var self = this;

                this.$el.html(this.template(this.model.toJSON()));
                // Set read/unread class
                if(this.model.get('read') === true) this.$el.addClass('read');
                    else this.$el.addClass('unread');

                // Set selected attribute
                this.$el.attr('selected', this.model.get('selected'));

                return this;
            }
    });
}
