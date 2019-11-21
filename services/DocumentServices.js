const mongo = require('mongodb')

const FileServices = require('./FileServices')
const fileServices = new FileServices()

const RevisionServices = require('./RevisionServices')
const revisionServices = new RevisionServices()

class DocumentServices {

  async getDocuments() {
    const {client, db} = await this.getConnection();
    const collection = db.collection('documents')

    const  documents = await collection.find({}).toArray();
    var listDocuments = []
    for (let doc of documents) {
      const revisions  = await revisionServices.getRevisions(doc._id)
      
      listDocuments.push( {
        'id': doc._id,
        'name': doc.name,
        'number of revisions': revisions.length,
        'lasted update': revisions[revisions.length - 1].timestamp

      })
    }

    client.close();
    return listDocuments
  }

  async getDocument(doc_id) {
    const {client, db} = await this.getConnection();
    const collection = db.collection('documents');

    const doc = await collection.findOne({_id: mongo.ObjectID(doc_id)});
    var revisions = await revisionServices.getRevisions(doc._id, true);

    doc.revisions = revisions;

    client.close()
    return doc
  }

  async createDoc(data,file, url) {
    
    const {client, db} = await this.getConnection();
    const collection =  db.collection('documents')

    let newDoc = {
      'name': data.name
    }

    newDoc = (await collection.insertOne(newDoc)).ops[0]
  
    await revisionServices.createRevision(data.notes, newDoc._id, file, url).catch( async (err)  => {
      
      await collection.deleteOne({_id: mongo.ObjectID(newDoc._id)})
      throw new Error(err);
    })

    client.close()
    return newDoc._id
  }

  async getConnection() {
    const MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=${process.env.DB_DATABASE}`
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(`${process.env.DB_DATABASE}`)

    return {client, db}
  }

}

module.exports = DocumentServices



