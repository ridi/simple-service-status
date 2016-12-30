const React = require('react');

const Button = require('react-bootstrap/lib/Button');
const RBModal = require('react-bootstrap/lib/Modal');

const Alert = require('react-bootstrap/lib/Alert');

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

  alert(message, level) {
    this.setState({ alertMessage: message, alertLevel: level });
  }

  render() {
    let modal = this;
    return (
      <RBModal show={this.state.showModal} onHide={e => this.close(e)}>
        <RBModal.Header closeButton>
          <RBModal.Title>{this.props.title}</RBModal.Title>
        </RBModal.Header>
        <RBModal.Body>
          <Alert style={{ display: this.state.alertMessage ? 'block' : 'none' }} bsStyle={this.state.alertLevel}>
            {this.state.alertMessage}
          </Alert>
          {this.props.children}
        </RBModal.Body>
        <RBModal.Footer>
          {this.props.buttons instanceof Array && this.props.buttons.map(button => {
            return (<Button onClick={e => button.onClick(e, modal)} bsStyle={button.style || 'default'}>{button.label}</Button>);
          })}
          <Button onClick={e => this.close(e)}>닫기</Button>
        </RBModal.Footer>
      </RBModal>
    );
  }
}

Modal.propTypes = {
  title: React.PropTypes.string,
};

module.exports = Modal;

