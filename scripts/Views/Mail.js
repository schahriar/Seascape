// @Aliceljm - http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function bytesToSize(bytes) {
    if(bytes == 0) return '0 Byte';
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

module.exports = function(Backbone, Composer) {
    return Backbone.View.extend({
        tagName:  "section",

        templates: {
            email: _.template(
                '<header class="pure-g">'
                +'<h2><%- subject %></h2>'
                +'<div class="pure-u-4-5 details">From <%- sender %> to <span>You</span></div>'
                +'<div class="pure-u-1-5 date"></div>'
                +'</header>'
                +'<section>'
                +'<div class="html"></div>'
                +'<ul class="attachments"></ul>'
                +'<div class="reply _inline">'
                +'</div>'
                +'</section>'),

            attachment: _.template(
                '<li class="attachment">'
                +'<a href="<%- link %>">'
                +'<%- fileName %> - <%- size %>'
                +'</a>'
                +'</li>'),
        },

        initialize: function() {
            //this.listenTo(this.model, 'change', this.render);
            //this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function() {
            var _this    = this;
            var email    = this.model.toJSON();
            var render   = this.$el.html(this.templates.email(email));

            // Inline Composer
            var text = "\n\n In reply to:\n----------------------------\n" + email.text;
            var composer = new Composer({ el: $(render).find('.reply'), to: email.sender, subject: "RE: " + email.subject, text: text, inline: true });

            // Render attachments
            var attachmentList = $(render).find('.attachments');
            _.each(email.attachments, function(attachment) {
                attachment.aID  = attachment.id.split(/[_ ]+/);
                attachment.id   = attachment.aID.shift();
                attachment.aID  = attachment.aID.join('_');
                attachment.link = window.root + "I" + attachment.id + "/attachment/" + attachment.aID;
                attachment.size = bytesToSize(attachment.length);
                attachmentList.append(_this.templates.attachment(attachment));
            })

            return this;
        }
    });
}
