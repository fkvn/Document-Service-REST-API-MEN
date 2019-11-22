const format = require('date-format');
const mongo = require('mongodb')
const databaseServices = require('./DatabaseServices')
const fileServices = require('./FileServices')

module.exports = {

  async getRevisions(docId, printVersion) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Revisions')

    var revisions = await collection.find({ 'documentId': mongo.ObjectID(docId) }).sort({ timestamp: 1 }).toArray()
    client.close()

    if (printVersion) {
      for (let revision of revisions) {
        const fileUrl = (await fileServices.getFile(revision.fileId)).url;
        revision.file = fileUrl;
        delete revision.documentId;
        delete revision.fileId;
      }
    }

    return revisions
  },

  async getRevision(docId, revisionId, printVersion) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Revisions')

    var revision = await collection.findOne({ 'documentId': mongo.ObjectID(docId), '_id': mongo.ObjectID(revisionId) })
    client.close()

    if (printVersion) {
      const fileUrl = (await fileServices.getFile(revision.fileId)).url;
      revision.file = fileUrl;
      delete revision.documentId;
      delete revision.fileId;
    }
    
    return revision
  },  

  async createRevision(req, documentId) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Revisions')

    var fullUrl = req.protocol + '://' + req.get('host') + '/files';
    const newFileId = await fileServices.uploadFile(req, fullUrl).catch((err) => {
      client.close()
      throw new Error(err);
    })
    
    var newRevision = {
      'notes': !req.body.notes ? "" : req.body.notes,
      'timestamp': format("MM-dd-yyyy hh:mm:ss", new Date()),
      'documentId': mongo.ObjectID(documentId),
      'fileId': newFileId
    }

    newRevision = (await collection.insertOne(newRevision).catch(async (err) => {
      await db.collection('files').deleteOne({ _id: mongo.ObjectID(newFileId._id) })
      client.close()
      throw new Error(err);
    })).ops[0]

    client.close()
    return newRevision._id
  },

  async updateRevision(docId, revisionId, notes) {
    const {client, db} = await databaseServices.getClient()
    const collection = db.collection('hw4Revisions')

    if (notes)
    {
      await collection.updateOne({ 'documentId': mongo.ObjectID(docId), '_id': mongo.ObjectID(revisionId) },
      { $set: { 'notes': notes} }).catch((err) => {
        client.close();
        throw new Error(err)
      });
    }

    client.close();
  },
}




