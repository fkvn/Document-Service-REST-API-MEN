const mongo = require('mongodb')
const format = require('date-format');
const databaseServices = require('./DatabaseServices')

module.exports = {

  async uploadFile(req, fullUrl) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Files')

    var newFile = {
      'name': req.file.originalname,
      'timestamp': format("MM-dd-yyyy hh:mm:ss", new Date()),
      'type': req.file.mimetype,
      'url': fullUrl,
      'fileData': req.file.buffer,
      'fileSize': req.file.size,
      'userId': req.user.userId
    }

    var insertedFile = (await collection.insertOne(newFile).catch((err) => {
      client.close();
      throw new Error(err)
    })).ops[0];

    const newUrl = insertedFile.url + "/" + insertedFile._id;
    insertedFile.url = newUrl
    
    await collection.updateOne({'_id': mongo.ObjectID(insertedFile._id)}, {$set: {url: newUrl}}).catch((err) => {
      client.close();
      throw new Error(err)
    });

    client.close();
    return insertedFile._id
  },

  async getFile(file_id) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Files')

    const file =  await collection.findOne({'_id': mongo.ObjectId(file_id)}).catch((err) => {
      client.close();
      throw new Error(err)
    })

    client.close();
    return file
  },
}





