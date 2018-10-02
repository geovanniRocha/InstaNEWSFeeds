let Parser = require('rss-parser');
const _ = require("lodash")
var knex = require('./db')
var SHA1 = require("SHA1")
var sanitizeHtml = require('sanitize-html');

var parser = new Parser({
    headers: {'charset':'UTF-8'},
  });

 
 (async () => {
    var regex = new RegExp('(alt|title|src)=("[^"]*")'  , "i")
    // DESCOBRIR UM JEITO DE NAO INSERIR NO BANCO OS VALORES QUE JA EXISTEM, FAZER UM SELECT ANTES? MUITO PROCESSAMENTO PRA NADA, VER SE TEM COMO INSERT IFNOT?

    //Select all feeds
    //foreach feed -> req url
    //foreach url -> insert news to DB with feedID

    knex.select().from('feed')
    //.where("idfeed", '21') // REMOVER ESSA LINHA PARA TODOS
    .timeout(1000)
    .then(db=>{
            _.each(db, async e =>{
                try{
                    feed = await parser.parseURL(e.url); 
                    console.log(feed)
                    _.each(feed.items,itemRSS => {       
                        console.log('each')                 
                        var tb = regex.exec(itemRSS.content);
                        if(tb){
                            tb = tb[2].replace('"', "")
                        }else{
                            tb = "https://picsum.photos/600/300/?image=25"
                        }
                        var data = {
                            title: itemRSS.title,
                            description :sanitizeHtml(itemRSS.contentSnippet),
                            url : itemRSS.link,
                            date: itemRSS.isoDate,
                            feed_idfeed : e.idfeed,
                            thumbnail: tb
                            //,urlHash : SHA1(url)
                        } 
                        console.log("Antes do insert")
                        knex.from('news')
                        .select(['news.url']) 
                        .where('news.url', data.url)
                        .bind(data).then(rSet=>{
                            console.log(rSet) 
                            console.log(data)
                            if(_.isEmpty(rSet)&& rSet != undefined){                                    
                                console.log("NAo existe, insirindo")
                                if(data)
                                    knex("news").insert(data).then()
                                return;
                            }
                        });
                        console.log("done")
                            return;
                    });
                    console.log("asd")
                    return;
                }catch(e){ }
                
            }) 
            return;
        
    })
})();
return;