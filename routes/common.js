// 라이브러리
const request   = require('request');
const mysql     = require('mysql');

/*
String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}*/

// 공통 함수
const replaceAll = (str, org, dest) => {
    return str.split(org).join(dest);
}
const trimTab = (str) => {
    return str.replace(/[\t\n\r]/gm, "").trim(); //str.replace(/^\s*|\s*$/g, "");
};
const removeSpecialChars = (str) => {
    return str.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
};
const makeUrl = (url, param) => {
    Object.keys(param).forEach((key, index) => {
        url = url + (index === 0 ? "?" : "&") + key + "=" + param[key];
    });
    return url;
};


// 프로미스화 함수
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


module.exports = {
    // 함수
    replaceAll,
    trimTab,
    removeSpecialChars,
    makeUrl,

    // 프로미스 함수
    doRequest,
    doQuery,
};
