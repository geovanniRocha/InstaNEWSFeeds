let Parser = require('rss-parser');
const _ = require("lodash")
var knex = require('./db') 
var sanitizeHtml = require('sanitize-html');
var request = require("request")

var parser = new Parser({
    headers: {'charset':'UTF-8'},
  });

 
 (async () => {
    var regex = new RegExp('(alt|title|src)=("[^"]*")'  , "i")
    

    knex.select().from('feed').timeout(1000)
    .then(db=>{
            _.each(db, async e =>{
                try{
                    feed = await parser.parseURL(e.url); 
                    console.log(feed)
                    _.each(feed.items,itemRSS => {       
                        console.log('each')                 
                        var tb = regex.exec(itemRSS.content);
                        if(tb ){
                            tb  = tb[2].replace('"', "")
                        }else{
                            tb  = "https://picsum.photos/600/300/?image=25"
                        }
                        var data = {
                            title: itemRSS.title,
                            description :sanitizeHtml(itemRSS.contentSnippet),
                            url : itemRSS.link,
                            date: itemRSS.isoDate,
                            feed_idfeed : e.idfeed,
                            thumbnail: tb  
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


request('https://newsapi.org/v2/top-headlines?country=br&apiKey=66741bed85f64f74a748e4330fa88b11',
{ json: true }, (err, res, body) => {
    if (err) { return console.log(err); }    
    _.each(body.articles, function (e) {

        if(e.title == null ||e.content == null ||e.url == null ||e.publishedAt == null ||e.urlToImage == null ){
            console.log("Campos faltando, Ignorar")
            return;
        }
        console.log("Campos Ok")
        var data = {
            title: e.title,
            description :e.content,
            url : e.url,
            date: e.publishAt,
            feed_idfeed : 28,
            thubnail:e.urlToImage
        } 
        if(data)
            knex("news").insert(data).then()
        return;
        
         
    })    
});

})();
return;