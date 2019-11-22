var express = require('express');
var router = express.Router();

const UserServices = require('../services/UserServices');
const userServices = new UserServices();

router.route('/')
  .get(async (req, res, next) => {
    try {
      res.send(await userServices.getUsers())
    } catch (error) {
      res.sendStatus(500)
    }
  })
  .post(async (req, res, next) => {
    if (!req.body.username || !req.body.password)
      res.sendStatus(500)
    try {
      await userServices.createUser(req.body.username, req.body.password)  
      res.sendStatus(201)
    } catch (error) {
      res.status(500).send(error.message)
    }
  })

module.exports = router;
