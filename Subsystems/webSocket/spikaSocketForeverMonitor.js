var forever = require('forever-agent');
var child = forever.Monitor(this);

child.on('watch:restart', function(info) {
    console.error('Restaring script because ' + info.file + ' changed');
});
 
child.on('restart', function() {
    console.error('Forever restarting script for ' + child.times + ' time');
});
 
child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
});