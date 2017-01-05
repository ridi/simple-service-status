const React = require('react');

class App extends React.Component {
  render() {
    const ChildComponent = require(`./${this.props.viewName}`);
    return React.createElement(ChildComponent, this.props);
  }
}

App.propTypes = {
  viewName: React.PropTypes.string.isRequired,
};

module.exports = App;
