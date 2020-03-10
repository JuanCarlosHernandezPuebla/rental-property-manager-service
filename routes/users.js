const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', (req, res, next) => {
  if (req.body.username && req.body.password) {
    User.authenticate(req.body.username, req.body.password, (error, user) => {
      if (error || !user) {
        let err = new Error('Invalid username or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/overview');
      }
    });
  } else {
    let err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

router.post('/create', (req, res, next) => {

  if (req.body.username && req.body.password) {

    let userData = {
      username: req.body.username,
      password: req.body.password
    }

    User.create(userData, (error, user) => {
      if (error) {
        console.log('error: ', error)
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.status(200).json({
          success: true,
          redirectUrl: '/overview'
        });
      }
    });

  } else {
    let err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

router.get('/overview', (req, res, next) => {
  User.findById(req.session.userId)
    .exec((error, user) => {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          let err = new Error('Not authorized!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;