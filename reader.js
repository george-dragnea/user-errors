const http = require('http');
const mongodb = require('mongodb');
const config = require('./config.json');

// Connect to MongoDB database
let db;
mongodb.MongoClient.connect(config.database.mongodb.url,
  { useNewUrlParser: true },
  (err, database) => {
    if (err) throw err;
    db = database.db(config.database.mongodb.database);
    console.log('Connected to MongoDB database.');
  });

// Create a HTTP server to listen
const server = http.createServer().listen(config.reader.port, config.reader.ip);
server.on('request', (req, res) => {
  // db.collection(config.database.mongodb.collection).drop();
  db.collection(config.database.mongodb.collection).find({}).sort({ date: -1 }).toArray((err, result) => {
    if (err) throw err;
    res.writeHeader(200, { 'Content-Type': 'text/html' });
    res.write('<html><title>User Errors</title><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous"><body><div class="container-fluid"><table class="table">');
    res.write('<tr><th>Project</th><th>User</th><th>Error</th><th>IP</th><th>URL</th><th>Extra</th><th>Data</th><th>Count</th></tr>');
    result.forEach((item) => {
      res.write(`<tr><td>${item.log.project ? item.log.project : ''}</td><td>${item.log.user ? item.log.user : ''}</td><td>${item.log.error ? item.log.error : ''}</td><td>${item.log.ip ? item.log.ip : ''}</td><td>${item.log.url ? item.log.url : ''}</td><td>${item.log.extra ? item.log.extra : ''}</td><td>${item.date.toUTCString()}</td><td>${item.count}</td></tr>`);
    });
    res.end('</div></table></body></html>');
  });
});

console.log('Reader listening on', config.reader.ip, config.reader.port);
