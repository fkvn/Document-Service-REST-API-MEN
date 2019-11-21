const format = require('date-format');
const mongo = require('mongodb')

const FileServices = require('./FileServices')
const fileServices = new FileServices()


class RevisionServices {

  async getRevisions(doc_id, printVersion) {
    
    const {client, db} = await this.getConnection();
    const collection = db.collection('revisions')
  
    var revisions = await collection.find({'documentId': mongo.ObjectID(doc_id)}).sort({timestamp: 1}).toArray()

    if (printVersion) {
      
      for (let revision of revisions) {
        const fileUrl = (await fileServices.getFile(revision.fileId)).url;
        revision.file = fileUrl;
        delete revision.documentId;
        delete revision.fileId;
      }
    }

    client.close()
    return  revisions
  }

  async getRevision(docId, revisionId, printVersion) {
    const {client, db} = await this.getConnection();
    const collection = db.collection('revisions')
    
    var revision = await collection.findOne({'documentId': mongo.ObjectID(docId), '_id': mongo.ObjectID(revisionId)})
    
    if (printVersion) {
        const fileUrl = (await fileServices.getFile(revision.fileId)).url;
        revision.file = fileUrl;
        delete revision.documentId;
        delete revision.fileId;
    }
    client.close()
    return  revision
  }

  async createRevision(notes, documentId, file, url) {
    const {client, db} = await this.getConnection();
    const collection = db.collection('revisions')

    const newFileId = await fileServices.uploadFile(file, url).catch((err) => {
      throw new Error(err);
    })
      
    var newRevision = {
      'notes': !notes ? "" : notes,
      'timestamp': format("MM-dd-yyyy hh:mm:ss", new Date()),
      'documentId': mongo.ObjectID(documentId),
      'fileId': newFileId  
    }

    newRevision = (await collection.insertOne(newRevision).catch(async (err) => {
      await db.collection('files').deleteOne({_id: mongo.ObjectID(newFileId._id)})
      throw new Error(err);
    })).ops[0]

    client.close()

    return newRevision._id
  }

  async updateRevision(docId, revisionId, notes) {
    const {client, db} = await this.getConnection();
    const collection = db.collection('revisions')

    if (!notes)
      console.log(revisionId);
      await collection.updateOne({'documentId': mongo.ObjectID(docId), '_id': mongo.ObjectID(revisionId)}, 
                                {$set: {'notes': notes}}).catch((err) => {
        throw new Error(err)
    });
    client.close();
  }

  async getConnection() {
    const MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=${process.env.DB_DATABASE}`
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(`${process.env.DB_DATABASE}`)
    await db.collection('revisions').createIndex({fileId: 1}, {unique:true})
    return {client, db}
  }


}

module.exports = RevisionServices



