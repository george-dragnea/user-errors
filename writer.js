const http = require('http');
const { parse } = require('querystring');
const mongodb = require('mongodb');
const config = require('./config.json');

let logs = [];
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
      if ('error' in post) {
        const log = {
          project: 'project' in post ? post.project : null,
          user: 'user' in post ? post.user : null,
          error: 'error' in post ? post.error : null,
          ip: 'ip' in post ? post.ip : null,
          url: 'url' in post ? post.url : null,
          extra: 'extra' in post ? post.extra : null,
        };
        const logIndex = logs.findIndex(item => JSON.stringify(item.log) === JSON.stringify(log));
        if (logIndex !== -1) {
          logs[logIndex].count += 1;
        } else {
          logs.push({ log, count: 1, date: new Date() });
        }
      }
      res.end();
    });
  }
});

// Insert log into database
setInterval(() => {
  if (logs.length > 0) {
    db.collection(config.database.mongodb.collection).insertMany(logs, (err) => {
      if (err) console.log(err);
    });
    logs = [];
  }
}, config.writer.bufferTime);

console.log('Writer listening on', config.writer.ip, config.writer.port);
