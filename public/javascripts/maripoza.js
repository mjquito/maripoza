// =============
// diplay object
// =============
function Write(notepad, window, btnParse) {
  this.np = notepad;
  this.doc = window;
  this.words = [];
  this.btnParse = btnParse;
}

Write.prototype.add = function(word) {
  this.words.push(word);
  word.getIPA();
};

Write.prototype.deleteTextNode = function(textNode) {
  return this.np.removeChild(textNode);
};

Write.prototype.createWordNode = function(text) {
  let wordContainer = this.doc.createElement('span');
  wordContainer.setAttribute('class', 'word');
  wordContainer.setAttribute('contenteditable', 'false');
  let englishNode = this.doc.createElement('span');
  englishNode.setAttribute('class', 'english');
  englishNode.setAttribute('contenteditable', 'true');
  englishNode.innerHTML = text;
  wordContainer.appendChild(englishNode);
  return englishNode;
};

Write.prototype.setIPA = function(wordNode, status) {
  if (wordNode.ipaNode) {
    // refresh
    wordNode.ipaNode.setAttribute('class', ['ipa', status].join(' '));
    wordNode.ipaNode.innerHTML = wordNode.ipa;
  } else {
    // brand new
    let node = this.doc.createElement('span');
    node.setAttribute('class', ['ipa', status].join(' '));
    node.setAttribute('contenteditable', 'false');
    node.innerHTML = wordNode.ipa;
    wordNode.ipaNode = node;
    wordNode.englishNode.parentNode.appendChild(wordNode.ipaNode);
  }

  if (wordNode.audioHTML) {
    let audioTempWrapper = this.doc.createElement('div');
    audioTempWrapper.innerHTML = wordNode.audioHTML;
    wordNode.audioNode = audioTempWrapper.firstChild;
    wordNode.audioNode.setAttribute('class', 'audio');
    wordNode.englishNode.parentNode.appendChild(wordNode.audioNode);
    wordNode.ipaNode.addEventListener('click', function(e) {
      wordNode.audioNode.play();
    });
  }
};

Write.prototype.parseNotePad = function() {
  // remove all ipa's if exist
  Array.from(this.np.querySelectorAll('.ipa')).forEach((n) => {
    n.parentNode.removeChild(n);
  });

  let text = this.np.innerText.trim();
  this.np.innerText = '';
  text = text.replace(/\u0020/g, '\u00A0');
  text = text.replace(/\n/g, '\u00A0\\n\u00A0');
  let split = text.split(/\s\n?/);

  if (!split.join('')) {
    split.pop();
  }
  // build string html
  let frag = [];
  split.forEach((e) => {
    if (e) {
      if (e === '\\n') {
        console.log('return');
        frag.push(this.doc.createTextNode('\n'));
      } else {
        let word = new Word(e, this);
        this.add(word);
        frag.push(word.englishNode.parentNode);
        frag.push(this.doc.createTextNode('\u00A0'));
      }
    } else {
      frag.push(this.doc.createTextNode('\u00A0'));
    }
  });
  frag.forEach((n) => {
    this.np.appendChild(n);
  });
};

Write.prototype.init = function() {
  this.btnParse.addEventListener('click', (e) => {
    this.parseNotePad();
  });
};

// =============
// other
// =============
let ipaStatus = {
  fail: 'ipa-fail',
  wait: 'ipa-wait',
  done: 'ipa-done'
};

// =============
// word
// =============
function Word(text, write) {
  this.raw = text;
  this.ipa = '';
  this.english = (this.raw.match(/\b\w+\b/)
    && this.raw.match(/\b\w+\b/)[0]) || null;
  this.ipaNode = null;
  this.audioHTML = null;
  this.audioNode = null;
  this.write = write;
  this.englishNode = this.write.createWordNode(this.raw);
}

Word.prototype.getIPA = function() {
  if (this.english) {
    let url = '/search/' + this.english;

    // set if is in local
    let saved = this.get();
    if (saved) {
      this.ipa = saved.ipa;
      this.audioHTML = saved.audioHTML;
      this.write.setIPA(this, ipaStatus.done);
      return;
    }

    // fetch it
    axios.get(url)
    .then((res) => {
      let ipa = res.data.ipa;
      let audio = res.data.audioHTML;
      if (ipa === 'not-found') {
        this.ipa = '/NF/';
        this.write.setIPA(this, ipaStatus.fail);
      } else {
        this.ipa = ipa;
        this.audioHTML = audio;
        this.write.setIPA(this, ipaStatus.done);
        this.save();
      }
    }).catch((err) => {
      this.ipa = '/Error/';
      this.write.setIPA(this, ipaStatus.fail);
    });

    // set waiting
    this.ipa = '/fetching.../';
    this.write.setIPA(this, ipaStatus.wait);
  }
};

Word.prototype.save = function() {
  let key = 'maripoza-' + this.english;
  let ipaObj = {
    ipa: this.ipa,
    audioHTML: this.audioHTML
  };
  window.localStorage.setItem(key, JSON.stringify(ipaObj));
};

Word.prototype.get = function() {
  let key = 'maripoza-' + this.english;
  return JSON.parse(window.localStorage.getItem(key));
};

// ===========
// begin
// ===========
let notepad = document.querySelector('.notepad');
let button = document.querySelector('.btn-parse');
notepad.focus();
let w = new Write(notepad, document, button);
w.init();
