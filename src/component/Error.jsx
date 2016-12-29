const React = require('react');
const Layout = require('./Layout');

class Error extends React.Component {
  render() {
    console.log(this.props);
    return (
      <Layout>
        <div>{this.props.statusCode}</div>
        <div>{this.props.errorTitle}</div>
        <div>{this.props.errorMessage}</div>
      </Layout>
    );
  }
}

Error.defaultProps = {
  statusCode: 0,
  errorTitle: 'Unknown Error',
  errorMessage: '',
};

Error.propTypes = {
  statusCode: React.PropTypes.number,
  errorTitle: React.PropTypes.string,
  errorMessage: React.PropTypes.string,
};

module.exports = Error;
