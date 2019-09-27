const express = require('express');
const router = express.Router();

const request = require('request');
const cheerio = require('cheerio');
const urlencode = require('urlencode');

router.get('/', function(req, res, next) {
  res.send('server');
});

router.get("/search", function(req, res, next){
  let param = {
    "q"    : urlencode("화학테스트"),
    "st"   : "KWRD",
    "si"   : "TOTAL",
    "lmtst": "OR",
    "lmt0" : "TOTAL",
    "cpp"  : "30",                // 검색 개수
    "bk_2" : "jttjaa000000jttj", // 중앙도서관
    "bk_1" : "jttjkorjttj",      // 한국어
    "bk_0" : "jttjmjttj",        // 단행본
  };

  let url = makeUrl("http://dl.jbnu.ac.kr/search/tot/result", param);
  let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0"
  };

  request({ url, headers },
    function(error, response, body) {
      const $ = cheerio.load(body);
      const result = [];

      $(".briefData").each(
        function (index, ele) {
          if ($(this).attr("id") === "divNoResult") { // 검색 결과가 없는 경우
            return;
          }

          let info = $(this).find(".bookline").map(function() {
            return $(this).text();
          });

          result[index] = {
            title     : trim($(this).find(".searchTitle").text()),
            author    : info[0],
            publisher : info[1],
            symbol    : info[2],
            number    : "",
          };
        });

      res.json(result);
    });

});

let trim = function (str) {
  return str.replace(/^\s*|\s*$/g, "");
};

let makeUrl = function (url, param) {
  Object.keys(param).forEach(function(key, index) {
    url = url + (index === 0 ? "?" : "&") + key + "=" + param[key];
  });
  return url;
};

module.exports = router;
