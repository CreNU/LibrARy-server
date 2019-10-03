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

module.exports = {
    trimTab,
    removeSpecialChars,
    makeUrl,
};
