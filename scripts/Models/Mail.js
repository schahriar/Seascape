var unknown = "unknown",
    fail = no = false,
    pass = yes = true,
    empty = "";

module.exports = function(Backbone) {
    return Backbone.Model.extend({
        urlRoot: '/api',
        idAttribute: 'eID',

        // Default attributes
        defaults: function() {
            return {
                eID: undefined,
                from: {
                    name: unknown,
                    email: unknown
                },
                to: new Array,
                subject: unknown,

                read: false,
                trash: false,
                spam: false,

                text: empty,
                excerpt: empty,
                html: unknown,

                selected: false,
                stamp: undefined
            };
        },

        initialize: function() {
            this.createExcerpt();
            if (this.get('html').length < this.get('text').length) this.set('html', this.get('text'))
        },

        setRead: function() {
            this.set('read', true);
            this.save({
                read: true
            }, {
                patch: true
            });
        },

        toggleSelection: function(toggle) {
            this.set('selected', toggle || !this.get('selected'));
        },

        createExcerpt: function() {
            var text = (this.get('text')) ? this.get('text') : this.get('html');
            var excerpt = text.substring(0, 200);

            if (text != excerpt) excerpt += "...";
            this.set('excerpt', excerpt);
        },

        markAs: function(mark) {
            var model = this;
            // If trashing from trash folder
            if((mark.trash === true) && (this.get('trash') === true))
                this.destroy();
            else {
                _.forEach(mark, function(value, key) {
                    mark[key] = !(model.get(key) && value)
                })
                this.set(mark).save(mark, { patch: true });
            }
        }

    })
}
