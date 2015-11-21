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
            full: _.template($('#template-composer-full').html()),

            inline: _.template($('#template-composer-inline').html())
        },

        initialize: function(options, to) {
            var _this = this;
            this.to = to || '';
            this.options = options;
            this.format = {};
            this.render();
            
            /* No Drafting for inline composers */
            // Create New Draft if not inlined
            if(!options.inline)
                $.post(window.root + "send", { draft: true })
                .done(function(msg) {
                    _this.id = msg.id;
                    _this.status = msg.status;
                });
        },

        // Render statistics and buttons
        render: function(e) {
            var _this = this;
            var options = _.defaults(this.options, {
                to: "",
                subject: "",
                text: "",

                inline: false
            });

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
            
            // Attachment zone
            this.zone = new Dropzone($(this.el).find("#message")[0], { // Make Message Body the dropzone
                url: function(){
                    var mail = _this.getMail(true);
                    return window.root + 'send/' + mail.id + '/attachment';
                }, // Set the url  
                maxFilesize: 10,
                paramName: "attachment",
                addRemoveLinks: true,
                dictRemoveFile: "x",
                autoQueue: true, // Auto-send
                previewsContainer: $(this.el).find("#preview")[0], // Define the container to display the previews
                clickable: $(this.el).find('[data-action="attach"]')[0]
            });
            // DropzoneJS Events
            // Set ref to every uploaded element
            this.zone.on('success', function(file, result) {
                $(file.previewElement).attr('id', result.ref);
                $(file.previewElement).find('.dz-remove').click(function() {
                    if (result.ref) {
                        var mail = _this.getMail(true);
                        $.ajax({
                            url: window.root + 'send/' + mail.id + '/attachment/' + result.ref,
                            type: 'DELETE'
                        });
                    }
                });
            });

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
            
            var UpdateDraft = _.debounce(function() {
                // Update Draft (REQUIRES AN ID)
                if(_this.id) $.post(window.root + "send", _this.getMail(true));
            }, 1000);
            
            $(this.el).find('input').bind('change', UpdateDraft);
            $(this.el).on('keypress', UpdateDraft);

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
                });
            });
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
            });
        },
        
        getMail: function(draft) {
            var el = $(this.el);
            var append = el.find('input[name="append"]').val() || "";
            var email = {
                to: el.find('input[name="to"]').val(),
                subject: el.find('input[name="subject"]').val(),
                text: el.find('#message').text() + append,
                html: el.find('#message').html() + append
            };
            
            // Assign Draft ID if Available
            if(this.id) email.id = this.id;
            
            // Assign Draft Bool if given
            if(draft) email.draft = (!!draft);
            
            return email;
        },

        submit: function(e) {
            e.preventDefault();

            var email = this.getMail();

            if ((email.html.length > 1) || window.confirm("Your message body seems to be empty. Do you still want send it?")) {

                $.post(window.root + "send", email)
                    .done(function(msg) {
                        alert("Message sent");
                    });

                // Force close panel
                this.close(null, true);
            }
        }

    });
};
