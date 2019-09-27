const express = require('express');
const router = express.Router();

const request = require('request');
const cheerio = require('cheerio');
const urlencode = require('urlencode');

router.get('/', function(req, res, next) {
  res.send('server');
});

router.get("/search", function(req, res, next){
  if (req.query.q === undefined || req.query.length < 3) {
    res.json([]);
    return;
  }

  const param = {
    q        : urlencode(req.query.q), // 검색어
    st       : "KWRD",
    si       : "TOTAL",
    lmtst    : "OR",
    lmt0     : "TOTAL",
    cpp      : "1",               // 검색 개수
    bk_2     : "jttjaa000000jttj", // 중앙도서관
    bk_1     : "jttjkorjttj",      // 한국어
    bk_0     : "jttjmjttj",        // 단행본
    briefType: "T",                // 테이블 형태
  };
  const url = makeUrl("http://dl.jbnu.ac.kr/search/tot/result", param);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0"
  };

  try {
    request({ url, headers }, (error, response, body) => {
      const $ = cheerio.load(body);
      const result = [];
      //console.log($("#briefTable tbody tr"));
      $("#briefTable tbody tr").each((index, ele) => {
        console.log(ele);
        if ($(this).attr("id") === "divNoResult") { // 검색 결과가 없는 경우
          return;
        }
        console.log($("td:nth-child(3) .searchTitle").text());
        result[index] = {
          title     : $("td:nth-child(3) .searchTitle").text(),
          author    : trimTab($("td:nth-child(4)").text()),
          publisher : trimTab($("td:nth-child(5)").text()),
          symbol    : trimTab($("td:nth-child(6)").text()),               // 십진분류 청구기호
          number    : $("td:nth-child(6)").text().split(" ")[0], // 숫자만
          state     : $("td:nth-child(3) .briefDeFont").text().includes("중앙도서관 대출가능"), // 대출가능 여부
        };
      });

      res.json(result); // JSON 출력
    });
  }
  catch {
    res.json(["err"]);
  }


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
