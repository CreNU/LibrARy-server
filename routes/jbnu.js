// 익스프레스
const express   = require('express');
const router    = express.Router();

// 라이브러리
const request   = require('request');
const cheerio   = require('cheerio'); // https://cheerio.js.org/
const urlencode = require('urlencode');
const mysql     = require('mysql');

// 기타
const common    = require('./common');


router.get('/', (req, res, next) => {
  res.send('server');
});
//const info = [];
//$(elem).find('td').map((i, elem) => info[i] = $(elem).text()); 

const doRequest = (url) => {
  return new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  });
};

const doQuery = (connection, query) => {
  return new Promise((resolve, reject) => {
    console.log(query);
    connection.query(query, (err, rows, fields) => {
      if (!err) {
        resolve(rows[0]);
      } else {
        reject(err);
      }
    });
  });
};










router.get('/search', async (req, res, next) => {
  let book_name = req.query.q;
  if (book_name === undefined || book_name.length <= 1) { // 쿼리 내용이 없거나 1글자인 경우
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
    cpp      : '5',               // 검색 개수
    bk_2     : 'jttjaa000000jttj', // 중앙도서관
    bk_1     : 'jttjkorjttj',      // 한국어
    bk_0     : 'jttjmjttj',        // 단행본
    briefType: 'T',                // 테이블 형태
  };
  const url = common.makeUrl('http://dl.jbnu.ac.kr/search/tot/result', param);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0'
  };

  let body;
  let result = [];

  // 전자도서관 쿼리
  try {
    body = await doRequest({
      url,
      headers,
    });
  } catch (err) {
    console.log('request failed!');
    console.log(err);
    res.json([]);
    return;
  }

  // 파싱
  try {
    const $ = cheerio.load(body);
    // 다행이도 cheerio의 each는 동기 함수임
    $('#briefTable tbody tr').each((i, elem) => {
      if (i % 2 !== 0) { // 짝수번째 행에는 데이터 없음 (i는 0부터 시작)
        return;
      }
      result.push({
        title     : $(elem).find('.searchTitle').text(),
        author    : common.trimTab($(elem).find('td:nth-child(4)').text()),
        publisher : common.trimTab($(elem).find('td:nth-child(5)').text()),
        symbol    : common.trimTab($(elem).find('td:nth-child(6)').text()), // 십진분류 청구기호
        canBorrow : $(elem).find('.briefDeFont').text().includes('중앙도서관 대출가능'), // 대출가능 여부
      });
    });
  } catch (err) {
    console.log('parse failed!');
    console.log(err);
    res.json([]);
    return;
  }

  /*
  const dbConfig = req.app.get('config').database;
  async function getResult(symbol) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);

      const table  = 'shelf_jbnu';
      const query  = "SELECT * FROM `" + table + "` WHERE symbol >= '" + symbol + "' ORDER BY pos LIMIT 1;";
      const result = await connection.query(query);

      console.log(result);

      connection.end();

      result['success'] = true;
      return result;

    } catch (err) {
      console.log('db query failed!');
      if (connection && connection.end) connection.end();
      return false;
    }
  }*/

  const dbConfig = req.app.get('config').database;
  const dbTable = 'shelf_jbnu';
  const connection = mysql.createConnection(dbConfig);
  //const Asymbol = symbol.replace(/[`~!@#$%^&*_|+\-=?;:'",<>\{\}\\\/]/gi, '').trim();
  
  connection.connect();

  for (const item of result) {
    console.log(item['symbol']);

    try {
      const query = "SELECT * FROM `shelf_jbnu` WHERE symbol >= '" + item['symbol'] + "' ORDER BY pos LIMIT 1;";

      const position = await doQuery(connection, query);
      item['success'] = true;
      item['pos'] = position;
    } catch (err) {
      console.log('db query failed!');
      console.log(err);
      item['success'] = false;
    }
    
  }
  
  if (connection && connection.end) {
    connection.end();
  }



  res.json(result); // JSON 출력
});










router.get('/pos', function(req, res, next) {
  const null_info = {
    floor: -1,
    shelf: -1,
    dir: -1,
    pos: -1,
  }

  let book_symbol = req.query.q;
  if (book_symbol === undefined) {
    res.json(null_info);
    return;
  }
  // prevent sql injection
  book_symbol = book_symbol.replace(/[`~!@#$%^&*_|+\-=?;:'",<>\{\}\\\/]/gi, '').trim();
  if (book_symbol.length < 3) {
    res.json(null_info);
    return;
  }

  const mysql      = require('mysql');
  const login_info = req.app.get('config').database;
  const connection = mysql.createConnection(login_info);
  
  const query = "SELECT * FROM `shelf_jbnu` WHERE symbol >= '" + book_symbol + "' ORDER BY pos LIMIT 1;";

  connection.connect();
  connection.query(query, (err, rows, fields) => {
    if (err) throw err;

    if (rows.length === 0) {
      res.json(null_info);
    } else {
      res.json(rows[0]);
    }
  });
  
  connection.end();
});




const getConnection = async (pool) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    return connection;
  } catch(err) {
    console.log('DB Error!');
    return false;
  }
};




module.exports = router;
