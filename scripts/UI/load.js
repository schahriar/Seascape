var $ = require('jquery');
var moment = require('moment');

onHold = function(event, element, self) {
    event.preventDefault();
    event.stopPropagation();

    var mail = self.find({ 'eID': element.attr('data-eid') });
    mail.toggleSelection();
}

module.exports = function(e) {
    var self = this;
    // Refresh elements
    this.el = $("section#list");
    this.view = $("#view");

    var element = $(e.currentTarget);
    var id = true;

    var timeoutId = setTimeout(function(){
        id = false;
        onHold(e, element, self);
        return false;
    }, 400);

    element.bind('mouseup mouseleave', _.once(function() {

        // Tap not hold
        clearTimeout(timeoutId);

        if(id !== true) return false;

        /* -- Toggle MailView Pane -- */

        var isActive = element.is('.active');
        self.toggleMailView(isActive);
        if(isActive) element.removeClass('active');

        /* -- -------------------- -- */

        /* -- Switch active element -- */

        if(!isActive){
            element.parent().find('.active').removeClass('active');
            element.addClass('active');
        }

        /* -- --------------------- -- */

        if(!isActive){

            var mail = self.find({ 'eID': element.attr('data-eid') });

            // Set to read
            mail.setRead(true);

            if(!mail) console.warn("No EMAIL found!");
            var view = new self.MailView({model: mail});

            var newElement = $(view.render().el);
            newElement.attr('data-eid',mail.get('eID'));

            // Extract date (from incoming and outbound messages)
            var parsedDate = (mail.get('stamp'))?mail.get('stamp').sent:mail.get('schedule').attempted;
            // Add better date parsing
            newElement.find('.date').text(moment(parsedDate).startOf('day').fromNow());

            self.view.html(newElement);

            // Timeout for css3 animation
            setTimeout(function(){
                // Refresh element
                self.view = $("#view");

                // ADD XSS Protection
                self.view.find('.html').html(mail.get('html'));

                // Fix link targets
                self.view.find('.html a').attr('target', '_blank');

                // Redirect cid embedded attachments
                self.view.find('.html img').each(function(){
                    if($(this).attr('src').substring(0, 4) === 'cid:') {
                        $(this).attr('src', "api/" + mail.get('eID') + "/attachment/cid=" + $(this).attr('src').substring(4))
                    }
                })

                // Add some smoothness here B)
                // Fix for html emails with wide content
                self.view.find('.html *').css({ maxWidth: self.view.find('section').width() });
            },400);
        }else{
            self.view.find('.html').html('...');
        }
    }));
}
