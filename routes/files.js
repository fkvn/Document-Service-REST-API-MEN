const express = require('express');
var router = express.Router();
const createError = require('http-errors');

const fileServices = require('../services/FileServices');

router.route('/:file_id')
  .get(async (req, res, next) => {
    try {
      var file = await fileServices.getFile(req.app.locals.db, req.params.file_id)

      if (file.userId != req.user.userId) {
        res.sendStatus(401)
      }
      else {
        res.setHeader('content-type', file.type);
        res.setHeader("Content-Disposition",`attachment; filename="${file.name}"`);
        res.send(file.fileData.buffer)
      }
    } catch (error) {
      next(createError(error.message))
    }
  })

module.exports = router;
