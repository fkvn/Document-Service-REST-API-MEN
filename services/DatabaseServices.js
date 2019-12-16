
var _db; 

module.exports = {
  async init() {
    const MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=${process.env.DB_DATABASE}`

    console.log(url);
    
    MongoClient.connect(url, function(err, db) {
      if(err) throw err;
      db.collectionNames(function(err, collections){
          console.log(collections);
      });
    });
    // const client  = await MongoClient.connect(url, { useUnifiedTopology: true });
    // _db = client.db(`${process.env.DB_DATABASE}`)

    // _db.collectionNames(function(err, collections){
    //   console.log(collections);
    // });
    
  },

  getDb() {
    return _db
  }
}
