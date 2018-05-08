import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Game from './Game';
import LoginPage from './LoginPage';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      jwt: ""
    }

    this.setJwt = this.setJwt.bind(this);
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path='/' 
            children={(props) => 
              <LoginPage 
              routeProps={props} 
              setJwt={this.setJwt}/>} />
          <Route exact path='/play' 
            children={(props) => 
              <Game
              routeProps={props} 
              jwt={this.state.jwt}/>} />
        </Switch>
      </BrowserRouter>
    );
  }

  setJwt(jwt){
    this.setState({jwt: jwt});
  }
}

export default App;
