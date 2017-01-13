const React = require('react');

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: { display: 'none' },
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.show) {
      this.setState({ style: {} });
    } else if (this.props.show && !newProps.show) { // true => false
      // set display to 'none' after 1 sec (for fade-out animation)
      setTimeout(() => this.setState({ style: { display: 'none' } }), 1000);
    }
  }

  render() {
    return <div className={`loading-backdrop fade ${this.props.show ? 'in' : ''}`} style={this.state.style}><div className="loading" /></div>;
  }
}
Loading.propTypes = {
  show: React.PropTypes.bool,
};

module.exports = Loading;