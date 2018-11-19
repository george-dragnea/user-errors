const http = require('http');
const { parse } = require('querystring');
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
const server = http.createServer().listen(config.writer.port, config.writer.ip);
server.on('request', (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const post = parse(body);
      const log = {
        project: 'project' in post ? post.project : null,
        user: 'user' in post ? post.user : null,
        error: 'error' in post ? post.error : null,
        ip: 'ip' in post ? post.ip : null,
        url: 'url' in post ? post.url : null,
        extra: 'extra' in post ? post.extra : null,
      };
      // Insert log into database
      if (log.error !== null) {
        db.collection(config.database.mongodb.collection).insertOne(log, (err) => {
          if (err) console.log(err);
        });
      }
      res.end();
    });
  }
});

console.log('Writer listening on', config.writer.ip, config.writer.port);
