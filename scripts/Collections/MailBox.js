module.exports = function(Backbone, Mail) {
    return Backbone.Collection.extend({
        url: '/api',

        // Reference to this collection's model.
        model: Mail,

        initialize: function(){
            //this.model.on('sync', this.onSync);
            //this.model.on('error', this.onError);
            //this.model.on('destroy', this.onDestroy);
        },

        // Filter down the list of all unread emails.
        read: function(eID) {
            return this.model.setRead();
        },

        parse: function (data) {
            if (_.isObject(data.results)) {

                // Set stats
                stats = {
                    folder: data.folder || stats.folder || 'inbox',
                    page: data.page,
                    pages: data.pages,
                    showing: data.showing,
                    total: data.total,
                }

                // Return results
                return data.results;
            } else {
                return data;
            }
        }
    });
}
