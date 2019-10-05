// 라이브러리
const request   = require('request');
const cheerio   = require('cheerio');
const urlencode = require('urlencode');

// 공통
const com       = require('./common');

// 파싱
const search    = async (title) => {

    const param = {
        topF1         : 'title_author',
        kwd           : urlencode(title), // 검색어
        category      : 'dan',            // 단행본
        type          : 'B1',             // 도서
        all           : 'on',
        pageNum       : '1',              // 페이지
        pageSize      : '30',             // 검색 개수
        detailSearch  : 'false',
        desc          : 'desc',
        selectedCount : '0',
        kdcddc        : 'kdc',
        yearType      : 'P',
        wonmunTabYn   : 'N',
        img           : 't',              // 테이블 형태
    };
    const url = com.makeUrl('http://www.nl.go.kr/nl/search/search.jsp', param);
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
        $('.searchTblList tbody tr').each((i, elem) => {
            result.push({
                title     : com.trimTab($(elem).find('td:nth-child(4)').text()),
                author    : com.trimTab($(elem).find('td:nth-child(5)').text()),
                publisher : com.trimTab($(elem).find('td:nth-child(6)').text()),
                symbol    : com.trimTab($(elem).find('td:nth-child(8)').text()), // 십진분류 청구기호
                canBorrow : true,
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
