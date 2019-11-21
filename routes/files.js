const express = require('express');
var router = express.Router();

const FileServices = require('../services/FileServices');
const fileServices = new FileServices();

router.route('/:file_id')
                .get(async (req, res, next) => {
                  var file = await fileServices.getFile(req.params.file_id)
                  res.setHeader('content-type', file.type);
                  res.setHeader("Content-Disposition",`attachment; filename="${file.name}"`);
                  res.send(file.fileData.buffer)
                })
module.exports = router;
