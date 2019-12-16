const mongo = require('mongodb')
const revisionServices = require('./RevisionServices')

module.exports = {
  async getDocuments(req) {
    const db = req.app.locals.db
    const docCollection = db.collection('Documents')
    
    
    const documents = await docCollection.find({ 'userId': mongo.ObjectID(req.user.userId) }).toArray();

    var listDocuments = []
    for (let doc of documents) {
      const revisions = await revisionServices.getRevisions(db, doc._id)

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

    const db = req.app.locals.db
    const docCollection = db.collection('Documents')

    const doc = await docCollection.findOne({ '_id': mongo.ObjectID(req.params.docId) });

    var revisions = await revisionServices.getRevisions(db, doc._id, true).catch((err) => {
      throw new Error(err)
    });

    doc.revisions = revisions;
    return doc
  },

  async createDoc(req) {
    const db = req.app.locals.db;

    const docCollection = db.collection('Documents')

    let newDoc = {
      'name': req.body.name,
      'userId': mongo.ObjectID(req.user.userId)
    }

    newDoc = (await docCollection.insertOne(newDoc)).ops[0]

    await revisionServices.createRevision(req, newDoc._id).catch(async (err) => {
      await docCollection.deleteOne({ _id: mongo.ObjectID(newDoc._id)})
      throw new Error(err);
    })

    return newDoc._id
  },

  async isAuthorized(req, res,next) {
    const db = req.app.locals.db
    const docCollection = db.collection('Documents')

    const doc = await docCollection.findOne({ '_id': mongo.ObjectID(req.params.docId) });
    
    if (doc.userId != req.user.userId) {
      next(createError(401))
    }
    next()
  }
}






