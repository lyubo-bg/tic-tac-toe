process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Game = require('../models/game');
let User = require('../models/user');


let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('Tic-tac-toe', () => {

    describe('/POST signup & signin', () =>{

        beforeEach((done) => { //Before each test we empty the database
            User.remove({}, (err) => { 
               done();         
            });     
        });

        it('it should Register user', (done) => {
            let user = {
                "username": "test",
                "password": "test"
            }

            chai.request(server)
            .post('/api/signup')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.msg.should.eql('Successful created new user.');
                done();
            });
        });

        it('it should not Register user when username exists', (done) => {
            let user = new User({
                "username": "test",
                "password": "test"
            });

            user.save(function(err){
                if(!err){
                    chai.request(server)
                    .post('/api/signup')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.success.should.be.false;
                        res.body.msg.should.eql('Username already exists.');
                    });
                    done();
                }
            });
        })

        it('it should not Register user when no username or password is sent', done =>{
            let user = new User({
                "username": "",
                "password": ""
            });

            chai.request(server)
            .post('/api/signup')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.success.should.be.false;
                res.body.msg.should.eql('Username and password can\'t be empty.');
                done();
            });
        });

        it('it should successfully sign in existing user', done =>{
            let user = new User({
                "username": "test",
                "password": "test"
            });

            chai.request(server)
            .post('/api/signup')
            .send(user)
            .end((err, res) => {
                if(!err){
                    chai.request(server)
                    .post('/api/signin')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.success.should.be.true;
                        res.body.token.should.include('JWT');
                        done();
                    });
                }
            });
        });

        it('it should not sign in non-existing user', done =>{
            let user = new User({
                "username": "test",
                "password": "test"
            });

            chai.request(server)
            .post('/api/signin')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.success.should.be.false;
                res.body.msg.should.eql('Authentication failed. User or password is wrong.'); 
                done();
            });
        });

        it('it should not sing in existing user with wrong pass', done => {
            let user = new User({
                "username": "test",
                "password": "test"
            });

            chai.request(server)
            .post('/api/signup')
            .send(user)
            .end((err, res) => {
                if(!err){
                    chai.request(server)
                    .post('/api/signin')
                    .send({"username": user.username, "password": "wrongpass"})
                    .end((err, res) => {
                        res.should.have.status(401);
                        res.body.success.should.be.false;
                        res.body.msg.should.eql('Authentication failed. User or password is wrong.'); 
                        done();
                    });
                }
            });
        })
    });

    describe('/POST || GET  getGame & startGame & move', () =>{
        var token;
        var username = "test";

        before((done) => {

            User.remove({}, (err) => { 
                let user = new User({
                    "username": "test",
                    "password": "test" 
                });
    
                chai.request(server)
                .post('/api/signup')
                .send(user)
                .end((err, res) => {
                    chai.request(server)
                    .post('/api/signin')
                    .send(user)
                    .end((err, res) => {
                        token = res.body.token;
                        done();
                    });
                });  
             });    
        });

        beforeEach((done) => { //Before each test we empty the database
            Game.remove({}, (err) => { 
                done();
            });     
        });

        it("it should start game successfully", done =>{
            let position = 0;
            let symbol = 'x';
            
            chai.request(server)
            .post('/api/startGame')
            .set('Authorization', token)
            .send({"position": position, "symbol": symbol})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.msg.should.eql('Successfully created new game.');

                let board = res.body.data.board;
                board[0].should.eql('x');
                board.includes('o');
                done();
            });
        });

        it("it should make valid move in game", done =>{
            let position = 4;
            let symbol = 'x';
            
            let game = new Game({
                board: ['x', '', '',
                        '',  '', '',
                        'o', '', ''],
                user: username
            })
            
            game.save(function(err){
                if(!err){
                    chai.request(server)
                    .post('/api/move')
                    .set('Authorization', token)
                    .send({"position": position, "symbol": symbol})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.msg.should.eql('Your move.');

                        let newBoard = res.body.data.board;
                        isValidBoard(game.board, newBoard).should.be.true;
                        done(); 
                    });
                }
            });
            
        });

        it("it should win game", done =>{
            let position = 4;
            let symbol = 'x';
            
            let game = new Game({
                board: ['o', 'o', '',
                        'x',  '', '',
                        'x', '', ''],
                user: username
            });

            game.save(function(err){
                if(!err){
                    chai.request(server)
                    .post('/api/move')
                    .set('Authorization', token)
                    .send({"position": position, "symbol": symbol})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.msg.should.eql('Bot wins.');
                        done(); 
                    });
                }
            });
        });

        it("it should lose game", done =>{
            let position = 6;
            let symbol = 'x';
            
            let game = new Game({
                board: ['x', 'o', '',
                        'x', 'o', '',
                        '', '', ''],
                user: username
            });

            game.save(function(err){
                if(!err){
                    chai.request(server)
                    .post('/api/move')
                    .set('Authorization', token)
                    .send({"position": position, "symbol": symbol})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.msg.should.eql('You win.');
                        done(); 
                    });
                }
            });
        });

        it("it should draw game", done =>{
            let position = 2;
            let symbol = 'x';
            
            let game = new Game({
                board: ['x', 'o', '',
                        'x', 'x', 'o',
                        'o', 'x', 'o'],
                user: username
            });

            game.save(function(err){
                if(!err){
                    chai.request(server)
                    .post('/api/move')
                    .set('Authorization', token)
                    .send({"position": position, "symbol": symbol})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.msg.should.eql('Game is draw.');
                        done(); 
                    });
                }
            });
        });

        it("it finishes game" , done =>{
            var symbol = 'x';
            var positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            var startPositionIndex = getNewPosition(positions);
            var startPosition = positions[startPositionIndex];
            var currentBoard;

            positions = positions.filter(item => item !== startPosition);

            chai.request(server)
            .post('/api/startGame')
            .set('Authorization', token)
            .send({"position": startPosition, "symbol": symbol})
            .end((err, res) => {
                if(error){
                    currentBoard = res.body.data.board;
                    makeMove(positions, currentBoard, symbol);
                }
            });
        });

        isValidBoard = function(oldBoard, newBoard){
            var newSymbolsCount = 0;
            var oldXCount = 0;
            var newXcount = 0;
            var oldOCount = 0;
            var newOCount = 0;

            for(var i = 0; i < 9; i ++){
                if(oldBoard[i] === 'x')
                {
                    oldXCount++;
                }
                
                if(newBoard[i] === 'x'){
                    newXcount++;
                }

                if(oldBoard[i] === 'o'){
                    oldOCount++;
                }

                if(newBoard[i] === 'o'){
                    newOCount++;
                }

                if(oldBoard[i] !== newBoard[i] && oldBoard[i] !== ''){
                    return false;
                }
                else if (oldBoard[i] !== newBoard[i] && oldBoard[i] === ''){
                    newSymbolsCount++;
                }
            }

            if(newSymbolsCount > 2){
                return false;
            }
            else if(newSymbolsCount == 2){
                if(oldOCount < newOCount && oldXCount < newXcount){
                    return true;
                }
                else {
                    return false;
                }
            }
            else if(newSymbolsCount == 1){
                if(oldXCount > newXCount && oldOCount == newOCount){
                    return true;
                } 
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        }

        makeMove = function(positions, board,  symbol){
            var newPos = pickPosition(positions, board);
            positions = positions.filter(item => item !== newPos);

            chai.request(server)
            .post('/api/move')
            .set('Authorization', token)
            .send({"position": position, "symbol": symbol})
            .end((err, res) => {
                if(res.body.msg === "You win." || res.body.msg === "Bot wins." || res.body.msg === "Game is draw."){
                    return true;
                } 
                else {
                    currentBoard = res.body.data.board;
                    makeMove(positions, currentBoard, symbol);
                }
            });
        }

        getNewPosition = function(positions){
            Math.floor(Math.random() * (positions.length + 1)) - 1
        }

        pickPosition = function(positions, board){
            var position = positions[getNewPosition(positions)];
            while(board[position] !== ''){
                position = positions[getNewPosition(position)];
            }
            return positions;
        }
        //will skip validation to test functionallity

    });
});