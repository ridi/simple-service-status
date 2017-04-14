/* global window document */

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import AppComponent from './component/App';
import './style/common.scss';

const appState = window.state;
const App = React.createFactory(AppComponent);
// const render = (Component) => {
//   ReactDOM.render(
//     //React.createElement(AppContainer, {}, Component),
//     (<AppContainer><Component /></AppContainer>),
//     document.getElementById('app-main')
//   );
// };

ReactDOM.render(
  //React.createElement(AppContainer, {}, Component),
  //(<AppContainer>{App(appState)}</AppContainer>),
  <AppContainer><AppComponent {...appState} /></AppContainer>,
  document.getElementById('app-main'),
);

//render(App(window.state));

if (module.hot) {
  module.hot.accept('./component/App', () => {
    //const AppNext = React.createFactory(require('./component/App'));
    //render(AppNext(window.state));
    ReactDOM.render(
      //React.createElement(AppContainer, {}, Component),
      (<AppContainer><AppComponent {...appState} /></AppContainer>),
      document.getElementById('app-main'),
    );
  });
}

/* global window document */
//require('./style/common.scss');

// const React = require('react');
// const ReactDOM = require('react-dom');
// const AppComponent = require('./component/App');
//
// const App = React.createFactory(AppComponent);
// const serverState = window.state;
//
// ReactDOM.render(App(serverState), document.getElementById('app-main'));
//
// if (module.hot) {
//   module.hot.accept();
// }
