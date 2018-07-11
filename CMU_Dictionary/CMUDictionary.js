/*
- This is from the CMU Pronouncing Dictionarying
- ARPABET phonemes that don't exist in the latest dicionary (0.7)
    AX      ə   (a)bout                 Vowel - Monophthongs
    AXR     ɚ   lett(er)                Vowel - R-colored vowel
    IX      ɨ   ros(e)s, rabb(i)t       
    UX      ʉ   d(u)de
    WH      ʍ
    Q       ʔ
    EN      n̩
    EM      m̩
    EL      l̩
    DX      ɾ
    NX      ɾ̃	

References
1. https://en.wikipedia.org/wiki/Arpabet
2. http://www.speech.cs.cmu.edu/cgi-bin/cmudict
*/

let mapping = {
/*
    Vowels - Monophthongs
    Arpabet	IPA	
    AA		ɑ		
    AE		æ		
    AH		ʌ (without stress is ə)
    AO		ɔ		
    EH		ɛ OR e 	
    IH		ɪ		
    IY		i		
    UH		ʊ	
    UW		u		
*/
'AA': 'ɑ',
'AA0': 'ɑ',
'AA1': 'ˈɑ',
'AA2': 'ˌɑ',

'AE': 'æ',
'AE0': 'æ',
'AE1': 'ˈæ',
'AE2': 'ˌæ',

'AH': 'ʌ',
'AH0': 'ə',
'AH1': 'ˈʌ',
'AH2': 'ˌʌ',

'AO': 'ɔ',
'AO0': 'ɔ',
'AO1': 'ˈɔ',
'AO2': 'ˌɔ',

'EH': 'ɛ',
'EH0': 'ɛ',
'EH1': 'ˈɛ',
'EH2': 'ˌɛ',

'IH': 'ɪ',
'IH0': 'ɪ',
'IH1': 'ˈɪ',
'IH2': 'ˌɪ',

'IY': 'i',
'IY0': 'i',
'IY1': 'ˈi',
'IY2': 'ˌi',

'UH': 'ʊ',
'UH0': 'ʊ',
'UH1': 'ˈʊ',
'UH2': 'ˌʊ',

'UW': 'u',
'UW0': 'u',
'UW1': 'ˈu',
'UW2': 'ˌu',
/*
    Vowels - Diphthongs
    -------------------
    EY		eɪ	
    AY		aɪ	
    OW		oʊ	
    AW		aʊ	
    OY		ɔɪ	
*/
'EY':'eɪ',
'EY0':'eɪ',
'EY1':'ˈeɪ',
'EY2':'ˌeɪ',

'AY':'aɪ',
'AY0':'aɪ',
'AY1':'ˈaɪ',
'AY2':'ˌaɪ',

'OW':'oʊ',
'OW0':'oʊ',
'OW1':'ˈoʊ',
'OW2':'ˌoʊ',

'AW':'aʊ',
'AW0':'aʊ',
'AW1':'ˈaʊ',
'AW2':'ˌaʊ',

'OY':'ɔɪ',
'OY0':'ɔɪ',
'OY1':'ˈɔɪ',
'OY2':'ˌɔɪ',

/*
Consonant - Stops
-----------------
P       p
B       b       
T       t
D       d
K       k
G       ɡ
*/
'P':'p',
'B':'b',      
'T':'t',
'D':'d',
'K':'k',
'G':'ɡ',
/*
Consonant - Affricates
----------------------
CH      tʃ
JH      dʒ
*/
'CH':'tʃ',
'JH':'dʒ',
/*
Consonant - Fricatives
----------------------
F       f
V       v
TH      θ
DH      ð
S       s
Z       z
SH      ʃ
ZH      ʒ
HH      h
*/
'F':'f',
'V':'v',
'TH':'θ',
'DH':'ð',
'S':'s',
'Z':'z',
'SH':'ʃ',
'ZH':'ʒ',
'HH':'h',
/*
Consonant - Nasal
----------------------
M       m
N       n
NG      ŋ
*/
'M':'m',
'N':'n',
'NG':'ŋ',
/*
Consonant - Liquid
----------------------
L       l
R       ɹ
*/
'L':'l',
'R':'ɹ',
/*
Vowels - R-colored vowels
-------------------------
ER      ɝ
ER0     ɝ
ER1     ˈɝ
ER2     ˌɝ
*/
'ER':'ɝ',
'ER0':'ɝ',
'ER1':'ˈɝ',
'ER2':'ˌɝ',
/*
Consonants - Semivowels
-------------------------
W       w
Y       j
*/
'W':'w',
'Y':'j',
}

// ==================================
// load
// ==================================
const fs = require('fs');
const path = require('path');
const readline = require('readline');
let fileName = process.env.DICTIONARY_FILE || 'cmudict-0.7b.txt';
let db = require('../models/dictionary');

/**
 * Load the file to the database
 */
function loadDict() {
    // get dictionary
    getDict(function(err, fd) {
        if (err) {
            throw new Error(err);
        } 
        
        let rl = readline.createInterface({
            input: fs.createReadStream('', {fd: fd}),
            terminal: false
        });

        rl.on('line', ln => {
            let row = parseLine(ln);
            if (row) {
                // insert to database
            }
        });
    });

}

function parseLine(line) {
    // if it starts with an 
    let reg = /^([A-Z][A-Z']+)(\(\d\))?\s\s(.+)$/;
    let word = {
        original: '',
        arpabet: '',
        ipa: '',
        version: null,
    };
    let res = line.match(reg);
    if (res) {
        return false;
    }    
    word.original = line;
    word.arpabet = res ;
    word.ipa = '';
    word.version = re
}

/**
 * Get file
 */
function getDict(done) {
    fs.open(path.join(__dirname, fileName), 'r', (err, fd) => {
        if (err) {
            done(err);
        } else {
            return done(null, fd);
        } 
    });
}

loadDict();


// module.exports = loadDic;