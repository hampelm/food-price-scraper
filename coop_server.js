var _ = require('lodash');
require('dotenv').load();
var pg = require('pg');
require('pg-parse-float')(pg);
var conString = process.env.POSTGRES;

var express = require('express');
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }

  app.get('/sql', function (req, res) {
    var query = req.query.query;
    if (!query) {
      res.status(400).send({ error: 'Query parameter required. Eg /sql?query="select * from coop limit 10"' });
      return;
    }
    console.log("Query:", query);
    client.query(query, function(error, data) {
      res.json({
        data: data
      });
    });
  });

  app.listen(process.env.PORT, function () {
    console.log('Example app listening on port', process.env.PORT);
  });
});




