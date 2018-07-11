const http = require('http');
const url = require('url');
const express = require('express');
const router = express.Router();

router.get('/:word', function(req, res, next) {
  return search(req.params.word)
  .then((ipa) => {
    res.json(ipa);
  })
  .catch((err) => next(err));
});

// function search(word) {
//   return new Promise((resolve, reject) => {
//     word = word.toLowerCase();
//     let parsedUrl = url.parse(
//         (process.env.URL || 'http://www.dictionary.com/browse/') + word
//     );

//     let options = {
//       host: parsedUrl.hostname,
//       port: parsedUrl.port,
//       path: parsedUrl.pathname,
//       method: 'GET'
//     };

//     let req = http.request(options);

//     // response
//     req.on('response', (res) => {
//       res.setEncoding('utf8');
//       let doc = '';
//       res.on('data', (chunk) => {
//         doc += chunk;
//       });
//       res.on('end', () => {
//         // require('fs').writeFileSync(
//         //   'C:\\Users\\mjquito\\Desktop\\html.txt', doc);
//         let data = {
//           ipa: 'not-found',
//           audioHTML: null
//         };
//         let ipaPattern = `(<span class="pron ipapron"\\s*?>)(.+)(<\/span>)`;
//         let ipaRegex = new RegExp(ipaPattern);
//         let ipa = (ipaRegex.exec(doc) || [])[2];
//         if (ipa) {
//           data.ipa = ipa.replace(/<[^>]*>/g, ' ').split(' ')
//           .filter((e) => e).join(' ');
//         }

//         data.audioHTML = (/<audio>.+<\/audio>/.exec(doc) || [])[0];
//         resolve(data);
//       });
//       res.on('error', (err) => {
//         reject(new Error('RESPONSE error: ' + err));
//       });
//     });

//     // request error
//     req.on('error', (err) => {
//       reject(new Error('REQUEST ERROR:' + err));
//     });

//     // request end
//     req.end();
//   });
// }

function search(word) {
  
}

// tree
let tree = {
  search,
  router
};

module.exports = tree;

