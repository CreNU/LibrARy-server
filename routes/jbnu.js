// 라이브러리
const request   = require('request');
const cheerio   = require('cheerio');
const urlencode = require('urlencode');

// 공통
const com       = require('./common');

// 파싱
const search    = async (title) => {

    const param = {
        q         : urlencode(title),   // 검색어
        st        : 'KWRD',
        si        : 'TOTAL',
        lmtst     : 'OR',
        lmt0      : 'TOTAL',
        cpp       : '20',               // 검색 개수
        bk_2      : 'jttjaa000000jttj', // 중앙도서관
        bk_1      : 'jttjkorjttj',      // 한국어
        bk_0      : 'jttjmjttj',        // 단행본
        briefType : 'T',                // 테이블 형태
    };
    const url = com.makeUrl('http://dl.jbnu.ac.kr/search/tot/result', param);
    const headers = {
        'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0',
    };


    // HTTP 요청
    let body;
    try {
        body = await com.doRequest({
            url,
            headers,
        });
    } catch (err) {
        console.log('[FAIL] Failed to request.');
        console.log(err);
        return false;
    }


    // 데이터 파싱
    const result = [];
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
        return false;
    }


    return result;
};



module.exports = {
    search,
};
