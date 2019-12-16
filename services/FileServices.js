const mongo = require('mongodb')
const format = require('date-format');

module.exports = {

  async uploadFile(req, fullUrl) {
    const db = req.app.locals.db
    const fileCollection = db.collection('Files')

    var newFile = {
      'name': req.file.originalname,
      'timestamp': format("MM-dd-yyyy hh:mm:ss", new Date()),
      'type': req.file.mimetype,
      'url': fullUrl,
      'fileData': req.file.buffer,
      'fileSize': req.file.size,
      'userId': req.user.userId
    }

    var insertedFile = (await fileCollection.insertOne(newFile).catch((err) => {
      throw new Error(err)
    })).ops[0];

    const newUrl = insertedFile.url + "/" + insertedFile._id;
    insertedFile.url = newUrl
    
    await fileCollection.updateOne({'_id': mongo.ObjectID(insertedFile._id)}, {$set: {url: newUrl}}).catch((err) => {
      throw new Error(err)
    });

    return insertedFile._id
  },

  async getFile(db, file_id) {
    
    const fileCollection = db.collection('Files')

    const file =  await fileCollection.findOne({'_id': mongo.ObjectId(file_id)}).catch((err) => {
      throw new Error(err)
    })

    return file
  },
}





