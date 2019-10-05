// 라이브러리
const createError  = require('http-errors');
const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');

// 앱 및 설정
const app          = express();
const configPath   = './config.json';
try {
    const fs = require("fs");
    fs.statSync(configPath);
} catch (err) {
    console.log('[FAIL] Config file does not exist.');
    console.log('[FAIL] Shutdown the server.');
    process.exit(0);
}
const config      = require('./config.json')[app.get('env')];
app.set('config', config);

// 뷰 엔진 정의
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// 라우터 정의
const indexRouter  = require('./routes/index');
const searchRouter = require('./routes/search');
const nlRouter     = require('./routes/nl');
const jbnuRouter   = require('./routes/jbnu');

// 라우터 등록
app.use('/'      , indexRouter);
app.use('/search', searchRouter);
app.use('/nl'    , nlRouter); // 국립중앙도서관
//app.use('/jbnu'  , jbnuRouter); // 전북대학교 중앙도서관


// 미등록 페이지는 오류로 처리
app.use((req, res, next) => {
    next(createError(404));
});

// 오류 처리
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
