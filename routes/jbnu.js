// 익스프레스
const express   = require('express');
const router    = express.Router();

// 라이브러리
const request   = require('request');
const cheerio   = require('cheerio');
const urlencode = require('urlencode');
const mysql     = require('mysql');

// 기타
const com       = require('./common');

// 요청 처리
router.get('/', async (req, res, next) => {
    let bookName = req.query.q;
    if (bookName === undefined || bookName.length <= 1) { // 쿼리 내용이 없거나 한 글자인 경우
        res.json([]);
        return;
    }
    req.connection.setTimeout(1000 * 30); // 30sec

    const param = {
        q        : urlencode(bookName), // 검색어
        st       : 'KWRD',
        si       : 'TOTAL',
        lmtst    : 'OR',
        lmt0     : 'TOTAL',
        cpp      : '20',               // 검색 개수
        bk_2     : 'jttjaa000000jttj', // 중앙도서관
        bk_1     : 'jttjkorjttj',      // 한국어
        bk_0     : 'jttjmjttj',        // 단행본
        briefType: 'T',                // 테이블 형태
    };
    const url = com.makeUrl('http://dl.jbnu.ac.kr/search/tot/result', param);
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
        // cheerio의 each는 동기 함수임
        $('#briefTable tbody tr').each((i, elem) => {
            if (i % 2 !== 0) { // 짝수번째 행에는 데이터 없음 (i는 0부터 시작)
                return;
            }
            result.push({
                title     : $(elem).find('.searchTitle').text(),
                author    : com.trimTab($(elem).find('td:nth-child(4)').text()),
                publisher : com.trimTab($(elem).find('td:nth-child(5)').text()),
                symbol    : com.trimTab($(elem).find('td:nth-child(6)').text()), // 십진분류 청구기호
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
    const dbConfig = req.app.get('config').database;
    const dbTable  = 'shelf_jbnu_new';
    const dbConn   = mysql.createConnection(dbConfig);
    try {
        dbConn.connect();
        // 책 각각의 위치 조회
        for (const item of result) {
            try {
                const symbol = item['symbol'].replace(/[`~!@#$%^&*_|+\-=?;:'",<>\{\}\\\/]/gi, '').trim();
                const query  = "SELECT * FROM `" + dbTable + "` WHERE symbol >= '" + symbol + "' ORDER BY symbol LIMIT 1;";
                const pos    = await doQuery(dbConn, query);

                if (pos.length > 0) { // 위치 정보가 있을 경우
                    const p = pos[0]['pos'] - 1; // 1~66 -> 0~65
                    item['floor']       = pos[0]['floor'];
                    item['shelf']       = pos[0]['shelf'];
                    item['pos']         = pos[0]['pos'];
                    item['dir']         = pos[0]['dir'];
                    item['col']         = parseInt(p / 6);
                    item['row']         = (p % 6);
                    item['success']     = true;
                    item['arAvailable'] = true;

                    if (item['dir'] === 1) { // Left
                        item['col']     = 11 - item['col'];
                        item['row']     =  6 - item['row'];
                    } else { // Right
                        item['col']++;
                        item['row']++;
                    }
                } else {
                    item['success']     = false;
                    item['arAvailable'] = false; // 미등록 책 (위치 모름)
                }
            } catch (err) {
                console.log('[FAIL] Cannot query book position.');
                console.log(err);
                item['success']     = false;
                item['arAvailable'] = false; // 데이터베이스 조회 실패
            }
        }
    } catch (err) {
        console.log('[FAIL] Cannot retrieve book\'s position.');
        console.log(err);
        res.json([]);
        return;
    } finally {
        if (dbConn && dbConn.end) {
            dbConn.end();
        }
    }



    res.json(result); // JSON 출력
});



// 프로미스로 변경
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
