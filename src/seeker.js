let Parser = require('rss-parser');
const _ = require("lodash")
var knex = require('./db') 
var sanitizeHtml = require('sanitize-html');
var request = require("request")

var parser = new Parser({
    headers: {'charset':'UTF-8'},
  });

 
function main (){
var regex = new RegExp('(alt|title|src)=("[^"]*")'  , "i")
request('https://newsapi.org/v2/top-headlines?country=br&apiKey=66741bed85f64f74a748e4330fa88b11',
{ json: true }, (err, res, body) => {
    if (err) { return console.log(err); }    
    _.each(body.articles, function (e) {

        if(e.title == null ||e.content == null ||e.url == null ||e.publishedAt == null ||e.urlToImage == null ){
            return;
        }
        //console.log("Campos Ok")
        var data = {
            title: e.title,
            description :e.content,
            url : e.url,
            date: new Date(e.publishedAt).toISOString().slice(0, 19).replace("T"," "),
            feed_idfeed : 88,
            thumbnail:e.urlToImage
        } 
        if(data)
           knex("news").insert(data).then().error(e=>{
               console.log(e)
           })
        return;
        
         
    })    


    knex.select().from('feed').timeout(1000)
    .then(db=>{
            _.each(db, async e =>{
                try{
                    if(e.url == "RESTAPI"){
                        return;
                    }
                    feed = await parser.parseURL(e.url); 
                    //console.log(feed)
                    _.each(feed.items,itemRSS => {       
                        //console.log('each')                 
                        var tb = regex.exec(itemRSS.content);
                        if(tb ){
                            tb  = tb[2].replace('"', "")
                        }else{
                            tb  = ""
                        }
                        var data = {
                            title: itemRSS.title,
                            description :sanitizeHtml(itemRSS.contentSnippet),
                            newsurl : itemRSS.link,
                            date: new Date(itemRSS.isoDate).toISOString().slice(0, 19).replace("T"," "),
                            feed_idfeed : e.idfeed,
                            thumbnail: tb  
                        } 
                        //console.log("Antes do insert")
                        knex.from('news')
                        .select(['news.url']) 
                        .where('news.url', data.url)
                        //.bind(data)
						.then(rSet=>{
                            //console.log(rSet) 
                            //console.log(data)
                            if(_.isEmpty(rSet)&& rSet != undefined){                                    
                                //console.log("Nao existe, insirindo")
                                if(data)
                                    knex("news").insert(data).then(()=>{
                                        console.log("Inserido")
                                    })
                                return;
                            }
                        });
                        //console.log("done")
                            return;
                    });
                    //console.log("asd")
                    return;
                }catch(e){ }
                
            }) 
            return;
        
    })


});

};

main()
 
 