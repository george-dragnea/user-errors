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
  db.collection(config.database.mongodb.collection).find({}).toArray((err, result) => {
    if (err) throw err;
    res.write(JSON.stringify(result));
    res.end();
  });
});

console.log('Reader listening on', config.reader.ip, config.reader.port);
