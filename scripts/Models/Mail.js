var unknown = "unknown",
    fail = no = false,
    pass = yes = true,
    empty = "";
    
var Anti = require('anti');
var XSSParser = new Anti({ experimentalInlineCSS: true })

module.exports = function(Backbone) {
    return Backbone.Model.extend({
        urlRoot: window.root,
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
            // Text or HTML shouldn't be undefined
            this.set('html', this.get('html') || "");
            this.set('text', this.get('text') || "");
            // XSS Protection
            this.set('html', XSSParser.parse(this.get('html')));
            if (this.get('html').length < (this.get('text'))?this.get('text').length:0) this.set('html', this.get('text'));
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
