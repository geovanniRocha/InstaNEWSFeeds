let Parser = require('rss-parser');
const _ = require("lodash")
var knex = require('./db')
const sha1 = require("SHA1")
let parser = new Parser({
    headers: {'charset':'UTF-8'},
  });

 
 (async () => {
 
    // DESCOBRIR UM JEITO DE NAO INSERIR NO BANCO OS VALORES QUE JA EXISTEM, FAZER UM SELECT ANTES? MUITO PROCESSAMENTO PRA NADA, VER SE TEM COMO INSERT IFNOT?

    //Select all feeds
    //foreach feed -> req url
    //foreach url -> insert news to DB with feedID

    knex.select().from('feed')
    //.where("idfeed", '21') // REMOVER ESSA LINHA PARA TODOS
    .timeout(1000)
    .then(db=>{
        _.each(db, item =>{            
            _.each(db, async e=>{
                try{
                    global.feed = await parser.parseURL(item.url); 
                }catch(e){ }
                _.each(global.feed.items,itemRSS => {
                    
                    data = {
                        title: itemRSS.title.toString("utf8"),
                        description :itemRSS.contentSnippet.toString("utf8"),
                        url : itemRSS.link.toString("utf8"),
                        date: itemRSS.isoDate,
                        feed_idfeed : item.idfeed,
                        urlHash : SHA1(url)
                    }
                    //console.log(data)
                    if(data)
                        knex("news").insert(data).then()
                });
            }) 
            return;
        })     
    })
})();