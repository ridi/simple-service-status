const React = require('react');
const ReactDOM = require('react-dom');
const AppComponent = require('./component/App.jsx');

const App = React.createFactory(AppComponent);
const mountNode = document.getElementById('app-mount');
const serverState = window.state;

ReactDOM.render(App(serverState), document.body);

if (module.hot) {
  module.hot.accept();
}