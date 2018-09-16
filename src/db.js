//Configuracao do Knex, exportar o modulo inteiro para nao repetir
//a configuracao da conexao com o sql
var knex = require('knex')({
    client: 'mysql',
    version: '5.7',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : '',
      database : 'instanews2'
    }
  });

module.exports = knex;