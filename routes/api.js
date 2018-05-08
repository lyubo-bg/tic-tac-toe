var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Game = require("../models/game");
var utils = require("../utils/utilities.js");
var jwt_decode = require('jwt-decode');

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

router.get('/getGame', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if(token){
    var parsedJwt = jwt_decode(token);

    Game.find({
      user: parsedJwt.username
    }, function(err, game){
      if(!game){
        return res.status(404).send({success: false, msg: 'No game found for user.'});
      } 
      else{
        return res.status(200).send({success: true, data: { board: game.board}});
      }
    });

  }
  else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/startGame', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var newBoard = ['','','','','','','','',''];
    var symbol = req.body.symbol;
    var position = req.body.position;

    if(symbol !== 'x' && symbol !== 'o'){
      return res.status(400).send({success: false, msg: 'Invalid symbol send.'});
    }

    if(position < 0 || position > 8){
      return res.status(400).send({success: false, msg: 'Invalid position send.'});
    }

    newBoard[position] = symbol;
    var parsedJwt = jwt_decode(token);

    Game.findOne({
      user: parsedJwt.username
    }, function(err, game){
      if(!game){
        var game = new Game({
          board: newBoard,
          user: parsedJwt.username
        });
  
        var botSymbol = (symbol === 'x') ? 'o' : 'x'; 
        
        var botMove = utils.calculateBotMove(game, botSymbol);
        game.board[botMove] = botSymbol;
        game.save(function(err) {
          if (err) {
            return res.json({success: false, msg: 'Something went wrong, can\' create game.'});
          }
          return res.json({success: true, msg: 'Successfully created new game.', data: {game: game}});
        });
      }
      else {
        return res.json({success: false, msg: "Can't create game, one already exists"});
      }
    });

    
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/move', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {

    var parsedJwt = jwt_decode(token);

    Game.findOne({
      user: parsedJwt.username
    }, function(err, game){
      if(!game){
        return res.status(404).send({success: false, msg: 'No game found for user.'});
      } 
      else{
        var playerSymbol = req.body.symbol;
        var playerMove = req.body.position;
        
        utils.validateMove(game, playerSymbol, playerMove, function(code, success, message){
          return res.status(code).send({success: success, msg: message});
        });
        
        game.board[playerMove] = playerSymbol;
        var gameStatus = utils.getGameStatus(game, playerSymbol);
        var botSymbol = (playerSymbol === 'x') ? 'o' : 'x'; 
        
        utils.evalBoard(gameStatus, res, function(code, success, message){
          if(code && success && message) {
            console.log(code + " " + success + " " + message);
            return res.status(code).send({success: success, msg: message});
          }
          else {
            var botMove = utils.calculateBotMove(game, botSymbol);
            game.board[botMove] = botSymbol;
            var gameStatusAfterBotMove = utils.getGameStatus(game, botSymbol);

            utils.evalBoard(gameStatusAfterBotMove, res, function(code, success, message){
              if(!code && !success && !message){              
                return res.status(200).send({success: true, msg: 'Your move.', data: {board: game.board}});
              } else if(code && success && message) {
                return res.status(code).send({success: success, msg: message});
              }
            });
          }
        });
      }
    });
  } else{
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});



module.exports = router;