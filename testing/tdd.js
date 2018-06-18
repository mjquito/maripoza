const {search} = require('../routes/search');
const {assert} = require('chai');

describe('Search', function() {
  this.timeout(6000);
  it('find word \'timeserver\'', function() {
    return search('timeserver')
    .then((res) => {
      assert.strictEqual('/ˈtaɪmˌsɜr vər/', res.ipa, 'it didnt match');
    });
  });
  it('find word \'ˈtɜr ki\'', function() {
    return search('turkey')
    .then((res) => {
      assert.strictEqual('/ˈtɜr ki/', res.ipa, 'it didnt match');
    });
  });

  it('find word \'moz\'', function() {
    return search('moz')
    .then((res) => {
      assert.strictEqual('/ mɒz /', res.ipa, 'it didnt match');
    });
  });

  it('find word a word that doesnt exist', function() {
    return search('amberrrrs')
    .then((res) => {
      assert.strictEqual('not-found', res.ipa, 'it didnt match');
    });
  });
  it('parse multiple IPAs', function() {
    return search('of')
    .then((res) => {
      let output = '/ʌv, ɒv; unstressed əv or, esp. before consonants, ə/';
      assert.strictEqual(output, res.ipa, 'It didnt match');
    });
  });

  it('parse audio of the word \'of\'', function() {
    return search('of')
    .then((res) => {
      let output = '<audio> <source src="http://static.sfdict.com/audio/lunawav/O00/O0050100.ogg" type="audio/ogg"> <source src="http://static.sfdict.com/audio/O00/O0050100.mp3" type="audio/mpeg"> </audio>';
      assert.strictEqual(output, res.audioHTML, 'It didnt match');
    });
  });
});
