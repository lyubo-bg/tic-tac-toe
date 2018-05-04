var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Game = require("../models/game");

getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
};

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
      res.json({success: false, msg: 'Please pass username and password.'});
    } else {
      var newUser = new User({
        username: req.body.username,
        password: req.body.password
      });
      // save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Username already exists.'});
        }
        res.json({success: true, msg: 'Successful created new user.'});
      });
    }
});

router.post('/signin', function(req, res) {
    User.findOne({
      username: req.body.username
    }, function(err, user) {
      if (err) throw err;
  
      if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // check if password matches
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.sign(user.toObject(), config.secret);
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token});
          } else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      }
    });
});


router.post('/startGame', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
      var newBoard = ['','','','','','','','',''];
      var symbol = req.body.symbol;
      var next;
    
      if(symbol === 'x' || symbol === 'o'){
        next = (symbol == 'o') ? 'x' : 'o'; 
      }
      else {
        return res.status(400).send({success: false, msg: 'Invalid symbol send.'});
      }

      var position = req.body.position;

      if(position < 0 || position > 8){
        return res.status(400).send({success: false, msg: 'Position send.'});
      }
      newBoard[position] = symbol;

      var game = new Game({
          board: newBoard,
          next: next,
          player: next
      });

      game.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Something went wrong, can\' create game.'});
        }
        res.json({success: true, msg: 'Successful new game.', game: game});
      });
    } else {
      return res.status(403).send({success: false, msg: 'Unauthorized.'});
    }
});

module.exports = router;