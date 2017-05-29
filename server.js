var express = require('express');
var path = require('path');
var port = process.env.PORT || 3000;
var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'));
}).listen(port, function() {
    console.log('listening on port ' + port);
});