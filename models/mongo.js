const MongoClient = require('mongodb').MongoClient;
const databaseName = process.env.DATABASE_NAME;
const fs = require('fs');
const path = require('path');
let db = null;

exports.connectDB = function(dbName) {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
        let uri = process.env.MONGO_URL;
        let a = MongoClient.connect(uri, {useNewUrlParser: true}, (err, client) => {
            if (err) return reject(err);            
            db = client.db(databaseName);
            resolve(db);
        });
    });
};

/**
 * stream data to set file for client
 */
exports.clientData = function() {
    return exports.connectDB()
    .then(db => {
        return new Promise((res, rej) => {
            let col = db.collection('cmudict');
            let stream = col.find(
                {isParsed: true}, 
                {projection: {_id: 0, word: 1, ipa: 1}})
                .stream({
                    transform: function(chunk, enc, cb) {
                        let r = `${chunk.word}  ${chunk.ipa}\n`;
                        return r;
                    }
                });
            res(stream);
        });
    })
}

exports.load = function(data) {
    return exports.connectDB()
    .then(db => {
        let col = db.collection('cmudict');
        return col.insertMany(data);
    })
    .then(res => {
        return res.insertedCount;
    })
};

// exports.count = function(_col) {
//     return exports.connectDB()
//     .then(db => {
//         let col  = db.collection(_col);
//         return col.countDocuments();
//     })
// };

exports.dropCol = function(col) {
    return exports.connectDB()
    .then(db => {
        return db.dropCollection(col);
    })
    .catch(err => {
        // if namespace not found, then let it proceed
        if (err.code === 26) {
            return;
        } else {
            throw err;
        }
    })
};