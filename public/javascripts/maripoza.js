'use script';
(function() {

// global
let db = null;
const DB_NAME = 'maripoza';
const CMU_OBJ_STORE = 'cmudict';
let $ = document.querySelector.bind(document);
const DOC = window.document;
let page = $('.page');
let loader = $('.loader');
$('#btnScrollTop').addEventListener('click', () => btnTopFunction());
window.onscroll = () => scrollFunction();

// =================
// mariposa
// =================
function Mariposa() {
  let w = new Write();
}
// =================
// mariposa
// =================
function Cmu() {
  this.init();
}
Cmu.prototype = {
  init: function() {
    return this.isCMULoaded()
    .then(isLoaded => {
      if (!isLoaded) {
        // get dic
        return axios({
          method: 'get',
          url: '/cmudict',
          responseType: 'text'
        })
        .then(inc => {
          let p = this.parseCMUDict(inc.data);
          p['isFinish'] = true;
          return this.saveDataToIDB(p);
        })
      }
      return Promise.resolve();
    })
    .then(() => {
      return showPage();
    })
    .catch(e => console.log(e));
  },
  parseCMUDict: function(data) {
    let arr = data.split('\n');
    let groups = {
        A: [],B: [],C: [],D: [],
        E: [],F: [],G: [],H: [],I: [],J: [],K: [],L: [],M: [],N: [],O: [],
        P: [],Q: [],R: [],S: [],T: [],U: [],V: [],W: [],X: [],Y: [],Z: [],
    }
    for (let i = 0; i < arr.length; i++) {
        let line = (arr[i]).trim();
        let fl = (line[0]);
        if (/^[A-Z]/.test(fl)) {
          let res = line.match(/(.+)\s\s(.+)/);
          if (!res) {
            console.log(line);
          }
          let word = {
            w: res[1],
            ipa: res[2]
          }
          groups[fl].push(word);
        }
    }
    return groups;
  },
  saveDataToIDB: function(set) {
    return idbInsert(CMU_OBJ_STORE, set);
  },
  isCMULoaded: function() {
    return idbGet(CMU_OBJ_STORE, 'isFinish')
  },
  getIPA: function (text) {
    let fl = text[0];
    return idbGet(CMU_OBJ_STORE, fl)
    .then((res) => {
      let ipas = [];
      for (let i = 0; i < res.length; i++) {
        if (text === res[i].w) {
          ipas.push(res[i].ipa);
        }
      }
      return ipas.join(' | ');
    });
  }
}

// ===========
// utilities
// ===========
function showPage() {
  page.classList.toggle('show');
  loader.classList.toggle('hide');
}

function idbConnect() {
  return new Promise((res, rej) => {
    if (db) {
      res(db);
    }
    let ro = indexedDB.open(DB_NAME);
    ro.onsuccess = (e) => {
      res(ro.result);
    };
    ro.onerror = (e) => {
      rej(e);
    }
    ro.addEventListener('upgradeneeded', (e) => {
        let os = ro.result.createObjectStore(CMU_OBJ_STORE);
    });
  });
}

function idbGet(osName, key) {
  return idbConnect()
  .then(db => {
    return new Promise((res, rej) => {
      let os = db.transaction(osName, 'readonly').objectStore(osName);
      let r = os.get(key);
      r.onsuccess = (e) => {
        res(r.result);
      }
      r.onerror = (e) => {
        rej(e.target.error);
      }
    })
  });
}

function idbInsert(osName, set) {
  return idbConnect()
  .then(db => {
    let tr = db.transaction(osName, 'readwrite');
    let co = tr.objectStore(osName);
    return new Promise((res, rej) => {
      let req;
      Object.getOwnPropertyNames(set).forEach(key => {
        req = co.add(set[key], key)
      });
      // catch the last one
      req.onsuccess = (e) => {
        res(true);
      };
      tr.onabort = (e) => {
        rej(new Error(event.target.error));
      }
    });
  });
}

let synth = window.speechSynthesis;
function speak(text) {
  console.log(text);
  let utterThis = new SpeechSynthesisUtterance(text);
  utterThis.rate = 0.7;
  synth.speak(utterThis)
}



let dics = [
  {src: 'https://www.merriam-webster.com/dictionary/$$$'},
  {src: 'https://www.vocabulary.com/dictionary/$$$'},
  {src: 'https://www.dictionary.com/browse/$$$'},
]; 

function showDictIframes(word) {
  let container = $('#dictionaries-iframes')
  if (!container) {
    return false;
  }
  // remove existing ones
  container.innerHTML = '';
  let loads = [];
  dics.forEach(d => {
    let iframe = document.createElement('iframe');
    iframe.setAttribute('class', 'dict-iframe');
    iframe.src = d.src.replace(/\$\$\$/, word)
    let p = new Promise((res, rej) => {
      iframe.onload = function() {
        res('finished');
      }
    })
    loads.push(p);
    container.append(iframe);
  })
  Promise.all(loads).then(x => {
    window.scrollTo(0, 0);
  })
}

function scrollFunction() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    $('#btnScrollTop').style.display='block';
  } else {
    $('#btnScrollTop').style.display='none';
  }
}

function btnTopFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// ===========
// write
// ===========
function Write() {
  this.np = $('.notepad');
  this.np.focus();
  this.cmu = new Cmu();
  DOC.execCommand('dequefaultParagraphSeparator', false, 'div');
  this.words = [];
  this.btnParse = $('.btn-parse');

  this.init();
}

Write.prototype.add = function(word) {
  this.words.push(word);
};

Write.prototype.parseNotePad = function() {
  // remove existing translation
  Array.from(DOC.querySelectorAll('.ipa')).forEach(w => {
    w.parentNode.removeChild(w);
  });
  
  // get content
  let text = (this.np.innerText).trim();
  if (!text) return;
  this.np.innerHTML = '';

  // a newer solution
  let nodes = [];
  let pat = /[A-Za-z\'\-]+/g;
  let match;
  let prev = 0;
  let res = [];
  let after = 0;
  while (match = pat.exec(text)) {
    after = match.index;
    if (prev != 0) {
      let buff = text.slice(prev, after);
      if (buff) {
        res.push(buff);
      }
    }
    res.push({word: match[0]});
    prev = pat.lastIndex;
  }

  if (!match) {
    let extra = text.slice(prev, text.length + 1);
    extra && res.push(extra);
  }

  let line = '<div>';
  let empty = true;
  let e;
  for (let i = 0; i < res.length; i++) {
    if (res[i].word) {
      line += Word.initWord(res[i].word);
    } else {
      for (let k = 0; k < res[i].length; k++) {
        e = res[i][k];
        if (e === '\n') {
          if (empty) {
            line += '<br>';
          }
          line += '</div><div>';
          empty = true;
        }
        else {
          empty = false;
          line += e;
        }
      }
    }
  }
  // add the next non-break space to have the carot back again
  line += '&nbsp;</div>';
  this.np.innerHTML = line;

  // remove all ipa's if exist
  Array.from(this.np.querySelectorAll('.word')).forEach((n) => {
    this.words.push(new Word(n, this))
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
let ipaStatus = Object.create(null);
ipaStatus = {
  error: {
    class: 'ipa-error',
    msg: '/ERROR/'
  },
  wait: {
    class: 'ipa-wait',
    msg: '/WAIT/'
  },
  done: {
    class: 'ipa-done'
  },
  nfound: {
    class: 'ipa-nfound',
    msg: '/NF/'
  }
};

// =============
// word
// =============
function Word(node, write) {
  this.write = write;
  this.english = node.querySelector('.english');
  this.english.addEventListener('mouseover', () => {
    
  });

  this.ipa = node.querySelector('.ipa');
  
  this.textForSearch = this.english.innerText.toUpperCase();
  this.getIPA();

  this.ipa.addEventListener('click', () => {
    speak(this.textForSearch);
  });

  this.ipa.addEventListener('dblclick', () => {
    showDictIframes(this.textForSearch);
  });
}

Word.initWord = function (text) {
  return `<span class='word'><span class='english'>${text}</span><span class='ipa' contenteditable=false></span></span>`;
}

Word.prototype.getIPA = function() {
  // fetch it
  this.write.cmu.getIPA(this.textForSearch)
  .then(ipa => {
    if (ipa) {
      ipa = '/' + ipa + '/';
      this.setIPA(ipaStatus.done, ipa);
    } else {
      this.setIPA(ipaStatus.nfound);
    }
  }).catch((err) => {
    this.setIPA(ipaStatus.error);
  });
  this.setIPA(ipaStatus.wait);
};

Word.prototype.setIPA = function(status, ipa) {
  this.ipa.classList.remove(ipaStatus.wait.class);
  this.ipa.classList.add(status.class);

  if (ipa) {
    this.ipa.innerHTML = ipa;
  } else {
    this.ipa.innerHTML = status.msg;
  }
};

// ===========
// begin
// ===========
(new Mariposa());
  
// for node.js
if (typeof module !== 'undefined') {
  module.exports = Maripoza;
}

})();
