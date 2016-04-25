var _ = require('lodash');
require('dotenv').load();
var moment = require('moment');
var osmosis = require('osmosis');
var data = [];
var date = moment().format("YYYY-MM-DD");

var pg = require('pg');
var conString = process.env.POSTGRES;


function save() {
  var i;

  //this initializes a connection pool
  //it will keep idle connections open for a (configurable) 30 seconds
  //and set a limit of 20 (also configurable)
  pg.connect(conString, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    function callback(error, result) {
      if(error) {
        console.log(error);
      }
      done();
    }

    for (i = 0; i < data.length; i++) {
      client.query('INSERT INTO coop (name, category, price, units, organic, origin, date) values ($1,$2,$3,$4,$5,$6,$7)', [
          data[i].name,
          '',
          data[i].price,
          data[i].units,
          data[i].organic,
          data[i].origin,
          date
        ], callback);
    }
  });
}


function parse() {
  var i;
  for(i = 0; i < data.length; i++) {
    // Split raw price into cost and units.
    var raw_price = data[i].raw_price;
    data[i].price = Number(_.trimLeft(raw_price, '$').split(' ')[0]);

    // Clean up the name
    var name = data[i].name.split('\n');
    if (name) {
      data[i].name = name[0];
    }

    var units = data[i].raw_price.split(' ');
    units.shift();
    data[i].units = units.join(' ');
    delete data[i].raw_price;

    // Add the date
    data[i].date = date;
    console.log(data[i]);
  }

  // Save all the data
  save();
}

osmosis
.get('http://foodcoop.com/produce')
.find('table.produce tbody tr')
.log(console.log)
.set({
    'name': 'td[1]',
    'raw_price': 'td[2]',
    'organic': 'td[3]',
    'origin': 'td[4]'
})
.data(function(listing) {
  data.push(listing);
})
.done(parse);



