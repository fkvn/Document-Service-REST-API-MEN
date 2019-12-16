// import
const express = require('express');
const createError = require('http-errors');

// export router
var router = express.Router();

// services
const documentServices = require('../services/DocumentServices');
const revisionServices = require('../services/RevisionServices');

// uploading files module
const multer = require("multer");
const uploadService = multer({storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 200}}); // limit 200MB

// routing
router.route('/')
  .get(async (req, res, next) => {  
    try {
      res.send(await documentServices.getDocuments(req))  
    } catch (error) {
      next(createError(error.message))
    }
  })
  .post(uploadService.single('file'), async (req, res, next) => {
    try {
      res.status(201).send(await documentServices.createDoc(req))
    } catch (error) {
      next(createError(error.message))
    }
  })

router.route('/:docId', documentServices.isAuthorized)
  .get(async (req, res, next) => {
    try {
      res.send(await documentServices.getDocument(req));
    } catch (error) {
      next(createError(error.message))
    }
  })

router.route('/:docId/revisions', documentServices.isAuthorized)
  .get( async (req, res, next) => { 
    try {
      res.send(await revisionServices.getRevisions(req.app.locals.db, req.params.docId, true))  
    } catch (error) {
      next(createError(error.message))
    } 
    
  })
  .post(uploadService.single('file'), async (req, res, next) => {
    try {
      var fullUrl = req.protocol + '://' + req.get('host') + '/files';
      var newRevisionId = await revisionServices.createRevision(req, req.params.docId)

      res.status(201).send(newRevisionId)  
    } catch (error) {
      next(createError(error.message))
    }
  })

router.route('/:docId/revisions/:revisionId', documentServices.isAuthorized)         
  .get(async (req, res, next) => {
    try {
      res.send(await revisionServices.getRevision(req.app.locals.db, req.params.docId, req.params.revisionId, true)) 
    } catch (error) {
      next(createError(error.message))
    }
  })
  .post(async (req, res, next) => {
    try {
      res.status(202).send(await revisionServices.updateRevision(req.app.locals.db, req.params.docId, req.params.revisionId, req.body.notes))
    } catch (error) {
      next(createError(error.message))
    }
  })

module.exports = router;
