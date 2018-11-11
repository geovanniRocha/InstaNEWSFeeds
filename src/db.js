 
var knex = require('knex')({
    client: 'mysql',
    version: '5.7',
    connection: {
      host : 'ec2-54-191-117-101.us-west-2.compute.amazonaws.com',
      user : 'instanews',
      password : 'iePheb7jBoorael5puL8Ez3u',
      database : 'instanews'
    }
  });

module.exports = knex;