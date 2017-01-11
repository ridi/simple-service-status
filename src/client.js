require('./style/common.scss');

const React = require('react');
const ReactDOM = require('react-dom');
const AppComponent = require('./component/App');

const App = React.createFactory(AppComponent);
const serverState = window.state;

ReactDOM.render(App(serverState), document.getElementById('app-main'));

if (module.hot) {
  module.hot.accept();
}
