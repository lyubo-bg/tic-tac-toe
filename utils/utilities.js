var enums = require("../enums/gameStatus.js");

module.exports = {
    getGameStatus: function(game, playerSymbol){

        if(((game.board[0] === game.board[4]) && (game.board[4] === game.board[8]) && (game.board[0] === playerSymbol)) 
        || ((game.board[2] === game.board[4]) && (game.board[4] === game.board[6]) && (game.board[2] === playerSymbol))){
            return enums.GameWon;
        }

        if(((game.board[0] === game.board[1]) && (game.board[1] === game.board[2]) && (game.board[0] === playerSymbol))
        || ((game.board[3] === game.board[4]) && (game.board[4] === game.board[5]) && (game.board[3] === playerSymbol))
        || ((game.board[6] === game.board[7]) && (game.board[7] === game.board[8]) && (game.board[6] === playerSymbol))
        || ((game.board[0] === game.board[3]) && (game.board[3] === game.board[6]) && (game.board[0] === playerSymbol))
        || ((game.board[1] === game.board[4]) && (game.board[4] === game.board[7]) && (game.board[1] === playerSymbol))  
        || ((game.board[2] === game.board[5]) && (game.board[5] === game.board[8]) && (game.board[2] === playerSymbol))){
            return enums.GameWon;;
        }  

        var draw = true;
        for(var i = 0; i < 9; i++){
            if(game.board[i] === ''){
                draw = false;
                break;
            }
        }

        if(draw){
            return enums.Draw;
        }

        return enums.InProgress;
    },

    calculateBotMove: function(game, botSymbol){
        for(var i = 0; i < 9; i ++){
            if(game.board[i] === ''){
                return i;
            }
        }
    },

    evalBoard: function(gameStatus, res, callback){
        if(gameStatus === enums.Draw){
            //return res.status(200).send({success: true, msg: 'Game is draw.'});
            return callback(200, true, 'Game is draw.');
        }
        else if(gameStatus === enums.InProgress){
            return callback();
        }
        else if(gameStatus === enums.GameWon){
            return callback(200, true, 'You win.')
        };
        
    },

    validateMove: function(game ,symbol, move, callback){
        if(symbol !== 'x' && symbol !== 'o'){
            callback(400, false, 'Invalid symbol sent.');
        }

        if(0 > move || move > 8){
            callback(400, false, 'Invalid position sent.');
        }

        if(game.board[move] !== ''){
            callback(400, false, 'Invalid position sent, field is not empty.');
        }
    },

    deleteGame: function(game){

    }
}