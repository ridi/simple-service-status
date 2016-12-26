const React = require('react');
const Layout = require('./Layout');
const StatusList = require('./StatusList');

class App extends React.Component {
  render() {
    return (
      <Layout>
        <StatusList items={this.props.items} columns={this.props.columns} />
      </Layout>
    );
  }
}

module.exports = App;