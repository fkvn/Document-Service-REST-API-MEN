const express = require('express');
var router = express.Router();

const DocumentServices = require('../services/DocumentServices');
const documentServices = new DocumentServices();

const RevisionServices = require('../services/RevisionServices');
const revisionService = new RevisionServices();

const multer = require("multer");
const uploadService = multer({storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 200}}); // limit 200MB

router.route('/')
  .get(async (req, res) => {  
    res.send(await documentServices.getDocuments())
  })
  .post(uploadService.single('file'), async (req, res) => {
    var fullUrl = req.protocol + '://' + req.get('host') + '/files';
    var newDocId = await documentServices.createDoc(req.body, req.file, fullUrl).catch((err) => {
      res.status(500).send("null")
    })
    res.status(201);
    res.send(newDocId);
  })

router.route('/:docId')
  .get(async (req, res) => {
    const doc = await documentServices.getDocument(req.params.docId)
    res.send(doc)
  })

router.route('/:docId/revisions')
  .get(async (req, res) => { 
    res.send(await revisionService.getRevisions(req.params.docId, true))
  })
  .post(uploadService.single('file'), async (req, res) => {
    var fullUrl = req.protocol + '://' + req.get('host') + '/files';
    var newRevisionId = await revisionService.createRevision(req.body.notes, 
                                              req.params.docId, req.file, fullUrl).catch((err) =>{
        res.status(500).send("null")                                     
    })
    res.status(201)
    res.send(newRevisionId)
  })

router.route('/:docId/revisions/:revisionId')         
  .get(async (req, res) => {
    res.send(await revisionService.getRevision(req.params.docId, req.params.revisionId, true).catch((err) => {
      res.status(500).send("null")
    }))
  })
  .post(async (req, res) => {
    if( !req.body.notes)
      res.sendStatus(500)
    
    await revisionService.updateRevision(req.params.docId, req.params.revisionId, req.body.notes).catch((err) => {
      res.status.send("null")
    })

    res.sendStatus(202)
  })



module.exports = router;
