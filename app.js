const path = require('path');
const express = require('express');
const cors = require('cors')
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://localhost:27017/local', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error:'));

db.once('open', () => {
  console.log('Db connected');
});

let app = express();

app.use(cors())

app.use(bodyParser.json({type: 'application/json'}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'wslifs ufhhmrs',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.use(express.static(path.resolve(__dirname, '../../public')));

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users');

app.use('/', indexRouter);

app.use('/users', usersRouter);

app.get('*', (req,res) =>{
  res.sendFile(path.resolve(__dirname, '../../public/index.html'));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json(
    {
      'error': {
        message: err.message,
        error: {}
      }
    });
});

app.use((req, res, next) => {
  console.log('Not found');
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

app.listen(3000, () => {
  console.log('Express app listening on port 3000');
});