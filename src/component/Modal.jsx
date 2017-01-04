const React = require('react');

const Button = require('react-bootstrap/lib/Button');
const RBModal = require('react-bootstrap/lib/Modal');

const Alert = require('react-bootstrap/lib/Alert');

const MODE_PRESET = {
  default: {
    buttons: [
      { label: '닫기', onClick: (e, modal) => modal.close(false) },
    ],
    size: 'large',
  },
  alert: {
    buttons: [
      { label: '확인', onClick: (e, modal) => modal.close(false) },
    ],
    size: 'small',
  },
  confirm: {
    buttons: [
      { label: '확인', onClick: (e, modal) => modal.confirm() },
      { label: '취소', onClick: (e, modal) => modal.close(true) },
    ],
    size: 'small',
  },
};

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

  close(isCancel) {
    this.setState({ showModal: false });
    if (isCancel) {
      if (this.props.onCancel) {
        this.props.onCancel();
      }
    }
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  confirm() {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
  }

  message(message, level) {
    this.setState({ alertMessage: message, alertLevel: level });
  }

  render() {
    const modal = this;

    let buttons = this.props.buttons;
    let size = this.props.size;
    if (!buttons) {
      buttons = MODE_PRESET[this.props.mode].buttons;
    }
    if (!size) {
      size = MODE_PRESET[this.props.mode].size;
    }

    return (
      <RBModal show={this.state.showModal} onHide={() => this.close(true)} bsSize={size || 'large'}>
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
          {buttons instanceof Array && buttons.map(button => (
            <Button onClick={e => button.onClick(e, modal)} bsStyle={button.style || 'default'}>{button.label}</Button>
          ))}
        </RBModal.Footer>
      </RBModal>
    );
  }
}

Modal.defaultProps = {
  mode: 'default',
};

Modal.propTypes = {
  title: React.PropTypes.string.isRequired,
  size: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
  mode: React.PropTypes.oneOf(['default', 'alert', 'confirm']),
  onConfirm: React.PropTypes.func,
  onCancel: React.PropTypes.func,
  onClose: React.PropTypes.func,
  buttons: React.PropTypes.objectOf({
    label: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func,
    style: React.PropTypes.oneOf(['default', 'primary', 'success', 'info', 'warning', 'danger', 'link']),
  }),
};

module.exports = Modal;

