// 익스프레스
const express   = require('express');
const router    = express.Router();

// 라이브러리
const mysql     = require('mysql');

// 공통
const com       = require('./common');


// 빈 라우터
router.get('/', (req, res, next) => {
    res.json([]);
});
router.get('/:lib/', (req, res, next) => {
    res.json([]);
});


// 도서 리스트 및 위치 검색
router.get('/:lib/:book', async (req, res, next) => {

    // 도서관 및 책 이름 가져오기
    let libName, bookTitle;
    try {
        libName   = com.removeSpecialChars(req.params.lib).trim();
        bookTitle = com.removeSpecialChars(req.params.book).trim();
    } catch (err) {
        res.json([]);
        return;
    }

    // 책 이름이 한 글자 이하이면 검색하지 않음
    if (bookTitle.length <= 1) {
        res.json([]);
        return;
    }

    // 응답 타임아웃 늘리기 (파싱에서 시간이 걸릴 수 있기 때문)
    req.connection.setTimeout(1000 * 30); // 30sec


    // 도서관 라우터 찾기
    let libRouter;
    switch (libName) {
        case 'jbnu':
        //case 'nl':
            libRouter = require('./' + libName);
            break;

        default:
            res.json([]);
            return;
    }

    // 책 검색
    const result = await libRouter.search(bookTitle);
    if (result === false) {
        res.json([]);
        return;
    }
    

    // 테스트 데이터베이스
    if (libName === 'jbnu')
        libName = 'jbnu2';

    // 책 위치 쿼리
    const dbConfig = req.app.get('config').database;
    const dbTable  = 'shelf_' + libName;
    const dbConn   = mysql.createConnection(dbConfig);
    try {
        dbConn.connect();
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
                    item['arAvailable'] = true;

                    if (item['dir'] === 1) { // Left
                        item['col']     = 11 - item['col'];
                        item['row']     =  6 - item['row'];
                    } else { // Right
                        item['col']++;
                        item['row']++;
                    }
                } else {
                    item['arAvailable'] = false;
                }
            } catch (err) {
                console.log('[FAIL] Cannot query book position.');
                console.log(err);
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

    // JSON 출력
    res.json(result);
});



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
