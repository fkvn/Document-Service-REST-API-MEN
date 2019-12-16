// import
var express = require('express');
var router = express.Router();

// jwt token
var jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET || 'no secret??';

// users' services
const userServices = require('../services/UserServices');

// routing
router.route('/')
  .post(async (req, res, next) => {
    try {
      const user = await userServices.getUser(req.app.locals.db, req.body.username, req.body.password)
      if (user)
      {
        res.json({
          'token': jwt.sign({
            "user": user.username,
            "userId": user._id
          }, jwtSecret)
        })
      }
      else
        res.sendStatus(403)  
    } catch (error) {
      res.status(500).send(error.message)
    }
  })

module.exports = router;
