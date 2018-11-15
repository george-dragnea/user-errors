var http = require('http');
var querystring = require('querystring');
var qs = require('qs');

var port = 8888;

var server = http.createServer().listen(port);

server.on('request', function (req, res) {
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var data = qs.parse(body);            
        });
    }
});

console.log('Listening on port ' + port);
