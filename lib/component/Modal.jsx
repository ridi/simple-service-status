const React = require('react');

const Button = require('react-bootstrap/lib/Button');
const RBModal = require('react-bootstrap/lib/Modal');

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  show() {
    this.setState({ showModal: true });
  }

  close() {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <RBModal show={this.state.showModal} onHide={e => this.close(e)}>
        <RBModal.Header closeButton>
          <RBModal.Title>{this.props.title}</RBModal.Title>
        </RBModal.Header>
        <RBModal.Body>
          {this.props.children}
        </RBModal.Body>
        <RBModal.Footer>
          <Button onClick={e => this.close(e)}>Close</Button>
        </RBModal.Footer>
      </RBModal>
    );
  }
}

Modal.propTypes = {
  title: React.PropTypes.string,
};

module.exports = Modal;

