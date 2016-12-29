const React = require('react');
const Layout = require('./Layout');
const Login = require('./Login');
const StatusList = require('./StatusList');

class App extends React.Component {
  render() {
    const ChildComponent = require(`./${this.props.childComponentName}`);
    return React.createElement(ChildComponent, this.props);
  }
}

module.exports = App;
