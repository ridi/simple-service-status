const React = require('react');
const StatusList = require('./StatusList');

class App extends React.Component {
  render() {
    return (
      <div>
        <StatusList items={this.props.items} columns={this.props.columns} />
      </div>
    );
  }
}

module.exports = App;