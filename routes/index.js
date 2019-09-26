const express = require('express');
const router = express.Router();

const request = require('request');
const cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/book", function(req, res, next){
  let url = "http://dl.jbnu.ac.kr/search/tot/result?q=%EB%AC%BC%EB%A6%AC&st=KWRD&si=TOTAL&lmtst=OR&lmt0=TOTAL&cpp=30&bk_2=jttjaa000000jttj&bk_1=jttjkorjttj&bk_0=jttjmjttj";

  request(url, function(error, response, body){
    let result = [];
    const $ = cheerio.load(body);

    $(".briefData").each(
      function (index, ele) {
        let trim = function (str) {
          return str.replace(/^\s*|\s*$/g, "");
        }
        result.push(trim($(this).find(".searchTitle").text()));
        console.log(trim($(this).find(".searchTitle").text()));
      }
    );

    res.json(result);
  });
})

module.exports = router;
