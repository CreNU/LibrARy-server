// 라이브러리
const createError  = require('http-errors');
const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');


// 앱 설정
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


// 뷰 엔진
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// 라우터
const indexRouter  = require('./routes/index');
const searchRouter = require('./routes/search');
app.use('/'      , indexRouter);
app.use('/search', searchRouter);


// 없는 라우터는 404 페이지로 처리
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
