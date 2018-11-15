var http = require('http');

var port = 9999;

var server = http.createServer().listen(port);

server.on('request', function (req, res) {
    res.write('Hello World!');
    res.end();
});

console.log('Listening on port ' + port);
