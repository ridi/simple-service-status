/* global window document */

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './component/App';
import './style/common.scss';

const appState = window.state;

ReactDOM.render(
  <AppContainer><App {...appState} /></AppContainer>,
  document.getElementById('app-main'),
);

if (module.hot) {
  module.hot.accept('./component/App', () => {
    ReactDOM.render(
      (<AppContainer><App {...appState} /></AppContainer>),
      document.getElementById('app-main'),
    );
  });
}
