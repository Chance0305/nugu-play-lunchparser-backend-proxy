const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const charset = require('charset');

module.exports = function(date, callback){
    const options = {
        url :"http://y-y.hs.kr/lunch.view?date=" + date,
        headers : {
            'User-Agent':'Mozilla/5.0'
        },
        encoding:null
    };
    request(options, function(err, res, body){
        const enc = charset(res.headers, body);
    
        const result = iconv.decode(body, enc);
        
        let $ = cheerio.load(result);
    
        let menu = $(".menuName > span");
        callback(menu.text());
    });
}