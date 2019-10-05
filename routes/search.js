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
router.get('/', (req, res, next) => {
    res.json([]);
});

router.get('/:lib/', (req, res, next) => {
    res.json([]);
});

router.get('/:lib/:book', async (req, res, next) => {
    let libName, bookName;
    try {
        libName  = com.removeSpecialChars(req.params.lib);
        bookName = com.removeSpecialChars(req.params.book);
    } catch (err) {
        res.json([]);
        return;
    }
    
    req.connection.setTimeout(1000 * 30); // 30sec






});



module.exports = router;
