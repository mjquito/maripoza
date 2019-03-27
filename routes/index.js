const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Maripoza'});
});

router.get('/cmudict', function(req, res, next) {
  res.status(200);
  res.set({
    'Content-Type': 'text/plain',
    'Content-Encoding': 'gzip'
  });
  let f = fs.createReadStream(
    path.resolve(__dirname, '../CMU_Dictionary/dict-ipa.txt.zip')
  );
  f.pipe(res);
  f.on('end', () => {
    res.end();
  });
});

module.exports = router;
