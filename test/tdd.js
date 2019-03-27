/* general */
const _path = require('path');
require('dotenv').config({path: _path.join(__dirname, '../.env')});
const {assert} = require('chai');
const fs = require('fs');


/* app */
const cmu = require('../CMU_Dictionary/cmudict');
const db = require('../models/mongo');

describe('CMU Dictionary', function() {
  this.timeout(9000);

  it('Loading file to db', function() {
    return db.dropCol('cmudict')
    .then(() => {
      return cmu.parse();
    }) 
    .then(data => {
      return db.load(data);
    })
    .then(count => {
      assert.deepStrictEqual(133910, count)
    })
  });

  it('Data for client', function() {
    let count = 0;
    return db.clientData()
    .then(stream => {
      return new Promise((res, rej) => {
        stream.on('data', (data) => count++);
        stream.on('end', () => res())
      });
    })
    .then(() => {
      assert.deepStrictEqual(133778, count);        
    });
  })

  it('Save dict to fiel for client to consume', function() {
    return db.clientData()
    .then(stream => {
      return cmu.saveToFile(stream);
    })
    .then(path => {
      let f = fs.existsSync(path);
      assert.isTrue(f);
    });
  });

  after(function() {

  })

  // it('ARPABET to IPA', function() {
  //   let words = [
  //     {ARPANET: 'ABANDONMENTS', IPA: ''},
  //     {ARPANET: 'ABDUCTOR(1)', IPA: ''},
  //     {ARPANET: 'BISUTEKI\'S', IPA: ''},      
  //     {ARPANET: 'DETROIT\'S(1)', IPA: ''},  
  //     {ARPANET: 'MIDDLE-OF-THE-ROAD', IPA: ''},
  //     {ARPANET: 'L.', IPA: ''},      
  //     {ARPANET: 'L.\'S', IPA: ''},
  //     {ARPANET: 'MASS.(1)', IPA: ''},
  //     {ARPANET: 'ST_JOHN', IPA: ''},  
  //   ];
  //   let pending = words.length;
    
  //   words.forEach((word) => {
  //     ld.getWord(word.ARPANET, function(err, ipa) {
  //       if (err) {
  //         return done(err);
  //       }
  //       if (word.IPA !== ipa) {
  //         return done(new Error(`ARPANET ${word.ARPANET} failed. Expected: ${word.IPA} but received: ${ipa}`))
  //       }
  //       if (!(--pending )){
  //         return done();
  //       }
  //     });
  //   });
  // });
});