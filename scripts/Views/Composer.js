var rangy = require('rangy');

module.exports = function(Backbone) {
    return Backbone.View.extend({
        el: null,

        // The DOM events specific to an item.
        events: {
            'click [data-submit]': "submit",
            'click [data-action="maximize"]': "max",
            'click [data-action="minimize"]': "min",
            'click [data-action="close"]': "close",
            'keyup input[name="subject"]': "title"
        },

        templates: {
            full: _.template('' + '<div class="overlay"></div>' + '<div class="title pure-g">' + '<div id="title" class="pure-u-20-24">New Email</div><div class="pure-u-1-24"></div>' + '<div class="pure-u-1-24 option" data-action="minimize"><i class="fa fa-minus"></i></div>' + '<div class="pure-u-1-24 option" data-action="close"><i class="fa fa-close"></i></div>' + '</div>' + '<form>' + '<input name="to" placeholder="To" value="<%- to %>">' + '<input name="subject" placeholder="Subject" autocomplete="off" value="<%- subject %>">' + '<div id="message" contenteditable="true"></div>' + '<div class="pure-g toolbar">' + '<button data-submit="true" class="pure-button pure-button-primary pure-u-2-5">Send</button>' + '<div class="pure-u-3-5 options">' + '<button data-editor="r" data-editor-format="removeFormat" class="fa fa-eraser editor-button">' + '<button data-editor="o" data-editor-format="insertOrderedList" class="fa fa-list-ol editor-button">' + '<button data-editor="o" data-editor-format="insertUnorderedList" class="fa fa-list-ul editor-button">' + '<button data-editor="t" data-editor-format="underline" class="fa fa-underline editor-button">' + '<button data-editor="t" data-editor-format="italic" class="fa fa-italic editor-button">' + '<button data-editor="t" data-editor-format="bold" class="fa fa-bold editor-button">' + '</div>' + '</div>' + '</form>' + ''),

            inline: _.template('' + '<form>' + '<input name="to" placeholder="To" value="<%- to %>" type="hidden">' + '<input name="subject" placeholder="Subject" autocomplete="off" value="<%- subject %>" type="hidden">' + '<div id="message" contenteditable="true"></div>' + '<input name="append" type="hidden" value="<%= text.replace(new RegExp("\\n", "g"), "<br>") %>">' + '<div class="pure-g toolbar">' + '<button data-submit="true" class="pure-button pure-u-2-5">Send</button>' + '</div>' + '</form>' + '')
        },

        initialize: function(options, to) {
            this.to = to || '';
            this.options = options;
            this.format = {};
            this.render();
        },

        // Render statistics and buttons
        render: function(e) {
            var _this = this;
            var options = _.defaults(this.options, {
                to: "",
                subject: "",
                text: "",

                inline: false
            })

            // Do a bunch of clever selection stuff later
            rangy.init();
            if (!this.options.inline)
                $(this.el).empty().append(this.templates.full(options));
            else
                $(this.el).empty().append(this.templates.inline(options));

            // Add inline attributes if inline
            if (this.options.inline === true) {
                $(this.el).addClass('inline');
                // Placeholder
                $(this.el).find('#message').attr('data-placeholder', "Reply to this message by writing your reply here ...");
            }

            // Bind keyboard
            $(this.el).bind('keydown', function(event) {
                if (event.ctrlKey || event.metaKey) {
                    switch (String.fromCharCode(event.which).toLowerCase()) {
                        case 's':
                            event.preventDefault();
                            break;
                        case 'b':
                            event.preventDefault();
                            _this.style('bold');
                            break;
                        case 'i':
                            event.preventDefault();
                            _this.style('italic');
                            break;
                        case 'u':
                            event.preventDefault();
                            _this.style('underline');
                            break;
                    }
                }
            });

            // Bind buttons
            $(this.el).find('[data-editor]').each(function() {
                $(this).click(function(e) {
                    e.preventDefault();

                    var format = $(this).attr('data-editor-format');
                    var argument = $(this).attr('data-editor-argument');
                    var type = $(this).attr('data-editor');

                    if (type != 'r') _this.style(format, argument);
                    else _this.removeStyles();

                    return false;
                })
            })
        },

        min: function(e) {
            $(this.el).parent().toggleClass('minimized')
        },

        close: function(e, force) {
            if ((!force) && ($(this.el).find('#message').html().length >= 1)) {
                if (window.confirm("This composer panel seems to contain a message and the content will be lost once closed. Do you still want to close it?")) {
                    this.remove();
                }
            } else {
                this.remove();
            }
        },

        title: function() {
            $(this.el).find('#title').text($(this.el).find('input[name="subject"]').val());
        },

        style: function(format, argument) {
            if (!this.format[format]) this.format[format] = {
                name: format
            };
            // Toggle
            this.format[format].status = !this.format[format].status;
            // Ommit
            this.format[format].argument = argument;
            // Execute
            document.execCommand(format, false, argument)
                // Style
            $(this.el).find('[data-editor-format="' + format + '"][data-editor="t"]').toggleClass('active', this.format[format].status);
            return this.format[format];
        },

        removeStyles: function() {
            var _this = this;
            _.map(this.format, function(format, parent) {
                if (format.status) document.execCommand(format.name, false, format.argument);
                $(_this.el).find('[data-editor-format="' + format.name + '"][data-editor="t"]').toggleClass('active', false);
                format.status = false;
                return format;
            })
        },

        submit: function(e) {
            e.preventDefault();

            var el = $(this.el);
            var append = el.find('input[name="append"]').val() || "";
            var email = {
                to: el.find('input[name="to"]').val(),
                subject: el.find('input[name="subject"]').val(),
                text: el.find('#message').text() + append,
                html: el.find('#message').html() + append
            }

            if ((email.html.length > 1) || window.confirm("Your message body seems to be empty. Do you still want send it?")) {

                $.post(window.root + "send", email)
                    .done(function(msg) {
                        alert("Message sent");
                    });

                // Force close panel
                this.close(null, true);
            }
        }

    })
}
