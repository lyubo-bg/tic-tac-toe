import React, { Component } from 'react';
import './Game.css';

var api = require("./api/api.js");

class Square extends React.Component {
    constructor(props){
      super(props);
    }

    render() {
      return (
        <button className="square" onClick={this.props.onClick} disabled={this.props.disabled}>
          {this.props.value}
        </button>
      );
    } 
  }

class Board extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        board: Array(9).fill(''),
        isX: true,
        isInitial: true
      };
    }

    componentDidMount(){
      debugger;
      var jwt = this.props.jwt;
      api.getWithAuth('/api/getGame', null, jwt).then(response =>{
        this.setState({board: response.data.board});
      }).catch(error => {
      
      });
    }

    handleClick(i){
      var newBoard = this.state.board;
      var symbol = this.state.isX ? 'x' : 'o';

      newBoard[i] = symbol;
      

      var params = {
        symbol: symbol,
        position: i
      }

      debugger;

      if(this.state.isInitial){
        api.getWithAuth("/api/startGame", params, this.props.jwt).then(response =>{
          console.log(response);
          //this.setState({board: response.data.board});
        }).catch(error => {

        });
      }
      else {
        

        api.postWithAuth("/api/move", params, this.props.jwt).then(response =>{
          console.log(response);
          debugger;
        }).catch(error => {
          debugger;
        });
      }

      this.setState({
        newBoard,
        isX: !this.state.isX,
        isInitial: false
      });
    }

    renderSquare(i) {
      return <Square onClick={() => this.handleClick(i)} value={this.state.board[i]} disabled={this.state.board[i] !== ''}/>;
    }

    boardIsEmpty(){
      for(var i = 0; i < 9; i ++){
        
      }
    }
  
    render() {
  
      return (
        <div>
          <div className="status">{this.state.isX ? 'Next is x' : 'Next is o'}</div>
          <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div>
        </div>
      );
    }
}

class Game extends React.Component {

    constructor(props){
      super(props);

      debugger;

      if(!props.jwt || props.jwt === ''){
        props.routeProps.history.push('/');
      }
    }

    render() {
      return (
        <div className="game">
          <div className="game-board">
            <Board jwt={this.props.jwt}/>
          </div>
          <div className="game-info">
            <div></div>
            <ol></ol>
          </div>
        </div>
      );
    }
}

export default Game;
