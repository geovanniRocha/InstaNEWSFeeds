let Parser = require('rss-parser');
const _ = require("lodash")
var knex = require('./db')
let parser = new Parser();

 
 (async () => {
 
    // DESCOBRIR UM JEITO DE NAO INSERIR NO BANCO OS VALORES QUE JA EXISTEM, FAZER UM SELECT ANTES? MUITO PROCESSAMENTO PRA NADA, VER SE TEM COMO INSERT IFNOT?

    //Select all feeds
    //foreach feed -> req url
    //foreach url -> insert news to DB with feedID

    knex.select().from('feed')
    //.where("idfeed", '21') // REMOVER ESSA LINHA PARA TODOS
    .timeout(1000)
    .then(db=>{
        _.each(db, async item =>{
            this.feed = await parser.parseURL(item.url);   
            _.each(this.feed.items,itemRSS => { 
                console.log(itemRSS.date)
                data = {
                    title: itemRSS.title.toString("utf8"),
                    description :itemRSS.content.toString("utf8"),
                    url : itemRSS.link.toString("utf8"),
                    date: itemRSS.isoDate,
                    feed_idfeed : item.idfeed
                }
                knex.select().from('feed').where('url', data.url).timeout(1000).then(e=>{
                    console.log(e)
                })
                knex("news").insert(data) 
               
            });
            return;
        })     
    })
})();