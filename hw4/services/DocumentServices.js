const mongo = require('mongodb')
const databaseServices = require('./DatabaseServices')
const revisionServices = require('./RevisionServices')

module.exports = {
  async getDocuments(req) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Documents')

    const documents = await collection.find({ 'userId': mongo.ObjectID(req.user.userId) }).toArray();
    
    client.close();

    var listDocuments = []
    for (let doc of documents) {
      const revisions = await revisionServices.getRevisions(doc._id)

      listDocuments.push({
        'id': doc._id,
        'name': doc.name,
        'number of revisions': revisions.length,
        'lasted update': revisions[revisions.length - 1].timestamp
      })
    }

    return listDocuments
  },

  async getDocument(req) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Documents')

    const doc = await collection.findOne({ '_id': mongo.ObjectID(req.params.docId) });
    
    client.close()

    var revisions = await revisionServices.getRevisions(doc._id, true).catch((err) => {
      client.close()
      throw new Error(err)
    });

    doc.revisions = revisions;
    return doc
  },

  async createDoc(req) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Documents')

    let newDoc = {
      'name': req.body.name,
      'userId': mongo.ObjectID(req.user.userId)
    }

    newDoc = (await collection.insertOne(newDoc)).ops[0]

    await revisionServices.createRevision(req, newDoc._id).catch(async (err) => {
      await collection.deleteOne({ _id: mongo.ObjectID(newDoc._id)})
      client.close()
      throw new Error(err);
    })

    client.close()
    return newDoc._id
  },

  async isAuthorized(req, res,next) {
    const { client, db } = await databaseServices.getClient()
    const collection = db.collection('hw4Documents')

    const doc = await collection.findOne({ '_id': mongo.ObjectID(req.params.docId) });
    client.close()
    
    if (doc.userId != req.user.userId) {
      next(createError(401))
    }
    next()
  }
}






