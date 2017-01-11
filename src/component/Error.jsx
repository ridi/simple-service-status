const React = require('react');

const Col = require('react-bootstrap/lib/Col');

class Error extends React.Component {
  render() {
    return (
      <Col xs={10} md={6} xsOffset={1} mdOffset={3}>
        <div>{this.props.statusCode}</div>
        <div>{this.props.errorTitle}</div>
        <div>{this.props.errorMessage}</div>
      </Col>
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
