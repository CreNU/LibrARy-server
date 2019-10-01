const express = require('express');
const router = express.Router();

const request = require('request');
const cheerio = require('cheerio'); // https://cheerio.js.org/
const urlencode = require('urlencode');

const common = require('./common');
const database = require('./database');

router.get('/', function(req, res, next) {
  res.send('server');
});


router.get('/search', (req, res, next) => {
  let book_name = req.query.q;
  if (book_name === undefined || book_name.length < 3) {
    res.json([]);
    return;
  }
  req.connection.setTimeout(1000 * 60); // request가 중복 요청되는 현상 방지


  const param = {
    q        : urlencode(book_name), // 검색어
    st       : 'KWRD',
    si       : 'TOTAL',
    lmtst    : 'OR',
    lmt0     : 'TOTAL',
    cpp      : '30',               // 검색 개수
    bk_2     : 'jttjaa000000jttj', // 중앙도서관
    bk_1     : 'jttjkorjttj',      // 한국어
    bk_0     : 'jttjmjttj',        // 단행본
    briefType: 'T',                // 테이블 형태
  };
  const url = common.makeUrl('http://dl.jbnu.ac.kr/search/tot/result', param);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0'
  };

  request({ url, headers }, (error, response, body) => {
    const $ = cheerio.load(body);
    const result = [];
    
    $('#briefTable tbody tr').each((i, elem) => {
      if (i % 2 !== 0) { // 짝수번째 행에는 데이터 없음 (i는 0부터 시작)
        return;
      }

      //const info = [];
      //$(elem).find('td').map((i, elem) => info[i] = $(elem).text()); 

      const title     = $(elem).find('.searchTitle').text();;
      const author    = common.trimTab($(elem).find('td:nth-child(4)').text());
      const publisher = common.trimTab($(elem).find('td:nth-child(5)').text());
      const symbol    = common.trimTab($(elem).find('td:nth-child(6)').text()); // 십진분류 청구기호
      const number    = symbol.split(' ')[0]; // 숫자만
      const state     = $(elem).find('.briefDeFont').text().includes('중앙도서관 대출가능'); // 대출가능 여부

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


router.get('/pos', function(req, res, next) {
  let book_symbol = req.query.q;
  if (book_symbol === undefined) {
    res.json([]);
    return;
  }
  book_symbol = book_symbol.replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\\\/]/gi, '').trim();
  if (book_symbol.length < 3) {
    res.json([]);
    return;
  }

  const mysql      = require('mysql');
  const connection = mysql.createConnection(database.info);
  
  connection.connect();
  
  connection.query("SELECT * FROM `shelf_jbnu` WHERE symbol >= '" + book_symbol + "' ORDER BY pos LIMIT 1;", (err, rows, fields) => {
    if (err) throw err;

    res.json(rows[0]);
  });
  
  connection.end();
});


module.exports = router;
