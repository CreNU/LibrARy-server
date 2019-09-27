const express = require('express');
const router = express.Router();

const request = require('request');
const cheerio = require('cheerio');

router.get('/', function(req, res, next) {
  res.send('server');
});

module.exports = router;
