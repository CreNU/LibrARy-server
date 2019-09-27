const express = require('express');
const router = express.Router();

const request = require('request');
const cheerio = require('cheerio');
const urlencode = require('urlencode');

// cheerio 공식문서 https://cheerio.js.org/

router.get('/', function(req, res, next) {
  res.send('server');
});

router.get("/search", function(req, res, next){
  if (req.query.q === undefined || req.query.length < 3) {
    res.json([]);
    return;
  }
  req.connection.setTimeout(1000 * 60); // request가 중복 요청되는 현상 방지

  const param = {
    q        : urlencode(req.query.q), // 검색어
    st       : "KWRD",
    si       : "TOTAL",
    lmtst    : "OR",
    lmt0     : "TOTAL",
    cpp      : "30",               // 검색 개수
    bk_2     : "jttjaa000000jttj", // 중앙도서관
    bk_1     : "jttjkorjttj",      // 한국어
    bk_0     : "jttjmjttj",        // 단행본
    briefType: "T",                // 테이블 형태
  };
  const url = makeUrl("http://dl.jbnu.ac.kr/search/tot/result", param);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0"
  };

  request({ url, headers }, (error, response, body) => {
    const $ = cheerio.load(body);
    const result = [];
    
    $("#briefTable tbody tr").each((i, elem) => {
      if (i % 2 !== 0) { // 짝수번째 행에는 데이터 없음 (i는 0부터 시작)
        return;
      }

      //const info = [];
      //$(elem).find("td").map((i, elem) => info[i] = $(elem).text()); 

      const title     = $(elem).find(".searchTitle").text();;
      const author    = trimTab($(elem).find("td:nth-child(4)").text());
      const publisher = trimTab($(elem).find("td:nth-child(5)").text());
      const symbol    = trimTab($(elem).find("td:nth-child(6)").text()); // 십진분류 청구기호
      const number    = symbol.split(" ")[0]; // 숫자만
      const state     = $(elem).find(".briefDeFont").text().includes("중앙도서관 대출가능"); // 대출가능 여부

      result.push({
        title,
        author,
        publisher,
        symbol,
        number,
        state,
      });
    });
    
    res.json(result); // JSON 출력
  });

});




let trimTab = (str) => {
  return str.replace(/[\t\n\r]/gm, "").trim(); //str.replace(/^\s*|\s*$/g, "");
};

let makeUrl = (url, param) => {
  Object.keys(param).forEach((key, index) => {
    url = url + (index === 0 ? "?" : "&") + key + "=" + param[key];
  });
  return url;
};

module.exports = router;
