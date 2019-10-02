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

// 요청 처리
router.get('/', async (req, res, next) => {
  let book_name = req.query.q;
  if (book_name === undefined || book_name.length <= 1) { // 쿼리 내용이 없거나 한 글자인 경우
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
    console.log('[FAIL] Failed to request.');
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
    console.log('[FAIL] Cannot parse tags.');
    console.log(err);
    res.json([]);
    return;
  }

  // 책 위치 쿼리
  try {
    // 데이터베이스 연결
    const dbConfig = req.app.get('config').database;
    const dbTable  = 'shelf_jbnu';
    const dbConn   = mysql.createConnection(dbConfig);
    dbConn.connect();
  
    // 책 각각의 위치 조회
    for (const item of result) {
      //console.log(item['symbol']);
      try {
        const symbol = item['symbol'].replace(/[`~!@#$%^&*_|+\-=?;:'",<>\{\}\\\/]/gi, '').trim();
        const query  = "SELECT * FROM `" + dbTable + "` WHERE symbol >= '" + symbol + "' ORDER BY pos LIMIT 1;";
        const pos    = await doQuery(dbConn, query);

        if (pos.length > 0) { // 위치 정보가 있을 경우
          item['floor']   = pos[0]['floor'];
          item['shelf']   = pos[0]['shelf'];
          item['pos']     = pos[0]['pos'];
          item['success'] = true;
        } else {
          item['success'] = false; // 미등록 책 (위치 모름)
        }
      } catch (err) {
        console.log('db query failed!');
        console.log(err);
        item['success'] = false; // 디비 조회 실패
      }
    }
    // 닫기
    if (dbConn && dbConn.end) {
      dbConn.end();
    }
  } catch (err) {
    console.log('[FAIL] Cannot retrieve book\'s position.');
    console.log(err);
    res.json([]);
    return;
  }



  res.json(result); // JSON 출력
});




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
    connection.query(query, (err, rows, fields) => {
      if (!err) {
        resolve(rows);
      } else {
        reject(err);
      }
    });
  });
};

module.exports = router;
