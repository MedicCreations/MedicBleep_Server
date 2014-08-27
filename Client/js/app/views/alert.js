var SPIKA_AlertView = Backbone.View.extend({
    className: 'alert',
    alerts: ['success', 'danger', 'info', 'warning'],
    template: _.template([
        '<%= message %>'
    ].join('')),
    initialize: function(options) {
        var message = options.msg || '';
        var alert = options.hasOwnProperty('alert') ? options.alert : 'info';
 
        if(_.indexOf(this.alerts, alert) === -1) {
            throw new Error('Invalid alert: [' + alert + '] Must be one of: ' + this.alerts.join(', '));
        }
 
        this.alert = alert;
        this.message = message;
    },
    render: function() {
        var output = this.template({ message: this.message });
        this.$el.addClass('alert-'+this.alert).
            html(output);
            
        this.$el.css('opacity',0);
        
        this.$el.animate({'opacity':1.0},500);
        return this;
    }
});
 
SPIKA_AlertView.msg = function($el, options) {
    var alert = new SPIKA_AlertView(options);
    $el.html(alert.render().el);
    return alert;
};