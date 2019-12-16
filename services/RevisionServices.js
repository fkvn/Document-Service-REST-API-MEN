const format = require('date-format');
const mongo = require('mongodb')
const fileServices = require('./FileServices')

module.exports = {

  async getRevisions(db, docId, printVersion) {
    
    const revCollection = db.collection('Revisions')
  
    var revisions = await revCollection.find({ 'documentId': mongo.ObjectID(docId) }).sort({ timestamp: 1 }).toArray()

    if (printVersion) {
      for (let revision of revisions) {
        const fileUrl = (await fileServices.getFile(db, revision.fileId)).url;
        revision.file = fileUrl;
        delete revision.documentId;
        delete revision.fileId;
      }
    }

    return revisions
  },

  async getRevision(db, docId, revisionId, printVersion) {

    const revCollection = db.collection('Revisions')

    var revision = await revCollection.findOne({ 'documentId': mongo.ObjectID(docId), '_id': mongo.ObjectID(revisionId) })

    if (printVersion) {
      const fileUrl = (await fileServices.getFile(db, revision.fileId)).url;
      revision.file = fileUrl;
      delete revision.documentId;
      delete revision.fileId;
    }
    
    return revision
  },  

  async createRevision(req, documentId) {
    const db = req.app.locals.db
    const revCollection = db.collection('Revisions')

    var fullUrl = req.protocol + '://' + req.get('host') + '/files';
    const newFileId = await fileServices.uploadFile(req, fullUrl).catch((err) => {
      throw new Error(err);
    })
    
    var newRevision = {
      'notes': !req.body.notes ? "" : req.body.notes,
      'timestamp': format("MM-dd-yyyy hh:mm:ss", new Date()),
      'documentId': mongo.ObjectID(documentId),
      'fileId': newFileId
    }

    newRevision = (await revCollection.insertOne(newRevision).catch(async (err) => {
      await db.collection('files').deleteOne({ _id: mongo.ObjectID(newFileId._id) })
      throw new Error(err);
    })).ops[0]

    return newRevision._id
  },

  async updateRevision(db, docId, revisionId, notes) {

    const revCollection = db.collection('Revisions')

    if (notes)
    {
      await revCollection.updateOne({ 'documentId': mongo.ObjectID(docId), '_id': mongo.ObjectID(revisionId) },
      { $set: { 'notes': notes} }).catch((err) => {
        throw new Error(err)
      });
    }

  },
}




