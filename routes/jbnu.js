const express = require('express');
const router = express.Router();

const request = require('request');
const cheerio = require('cheerio');

router.get('/', function(req, res, next) {
  res.send('server');
});

router.get("/search", function(req, res, next){
  let param = {
    "q": "%EB%AC%BC%EB%A6%AC",
    "st": "KWRD",
    "si": "TOTAL",
    "lmtst": "OR",
    "lmt0": "TOTAL",
    "cpp": "30",
    "bk_2": "jttjaa000000jttj",
    "bk_1": "jttjkorjttj",
    "bk_0": "jttjmjttj",
  };

  let url = makeUrl("http://dl.jbnu.ac.kr/search/tot/result", param);

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


function makeUrl(url, param) {
  Object.keys(param).forEach(function(key, index) {
    url = url + (index === 0 ? "?" : "&") + key + "=" + param[key];
  });
  return url;
}

module.exports = router;
