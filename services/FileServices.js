const mongo = require('mongodb')
const format = require('date-format');

class FileServices {

  async uploadFile(file, fullUrl) {
    const {client, db} = await this.getConnection();
    const collection = db.collection('files')

    var newFile = {
      'name': file.originalname,
      'timestamp': format("MM-dd-yyyy hh:mm:ss", new Date()),
      'type': file.mimetype,
      'url': fullUrl,
      'fileData': file.buffer,
      'fileSize': file.size
    }

    var insertedFile = (await collection.insertOne(newFile).catch((err) => {
      throw new Error(err)
    })).ops[0];

    const newUrl = insertedFile.url + "/" + insertedFile._id;
    insertedFile.url = newUrl
    
    await collection.updateOne({'_id': mongo.ObjectID(insertedFile._id)}, {$set: {url: newUrl}}).catch((err) => {
      throw new Error(err)
    });

    client.close();
    return insertedFile._id
  }

  async getFile(file_id) {
    const {client, db} = await this.getConnection();
    const collection = db.collection('files')

    const file =  await collection.findOne({'_id': mongo.ObjectId(file_id)})
  
    client.close();
    return file
  }

  async getConnection() {
    const MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=${process.env.DB_DATABASE}`
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(`${process.env.DB_DATABASE}`)

    return {client, db}
  }


}

module.exports = FileServices



