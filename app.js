// import 
require('dotenv').config()

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser')

// routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const documentsRouter = require('./routes/documents')
const filesRouter = require('./routes/files')
const loginRouter = require('./routes/login')

const passport = require('./middleware/passport')
const isLoggedIn = passport.authenticate('jwt', {session: false})

const app = express();

/**
 * Set up Database connection
 */

const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=${process.env.DB_DATABASE}`

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    const db = client.db(`${process.env.DB_DATABASE}`);
    
    app.locals.db = db
  }).catch(error => console.error(error));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.get('/favicon.ico', (req, res, next) => {
  return res.sendStatus(204);
}) 


// middleware
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// routing middleware
app.use('/', indexRouter);
app.use('/login', loginRouter)
app.use('/users', usersRouter);
app.use('/documents', isLoggedIn, documentsRouter);
app.use('/files', isLoggedIn, filesRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
