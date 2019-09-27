var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 라우터 정의
var indexRouter = require('./routes/index');
var nlRouter    = require('./routes/nl');   // National Library of Korea
var jbnuRouter  = require('./routes/jbnu'); // Chonbuk National University (JBNU)

var app = express();

// 뷰 엔진 정의
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 인덱스 - 미사용
app.use('/', indexRouter);

// 국립중앙도서관
app.use('/nl', nlRouter);

// 전북대학교 중앙도서관
app.use('/jbnu', jbnuRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
