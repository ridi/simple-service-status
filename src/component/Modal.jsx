import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal as RBModal,
  Alert,
} from 'react-bootstrap';

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

export default class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      alertMessage: null,
    };
  }

  show() {
    this.setState({ showModal: true, alertMessage: null });
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
      <RBModal show={this.state.showModal} onHide={() => this.close(true)} bsSize={size || 'large'} backdrop="static">
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
            <Button
              onClick={(e) => { button.isClose ? this.close(true) : button.onClick(e, modal); }}
              bsStyle={button.style || 'default'}
              disabled={button.disabled}
            >
              {button.label}
            </Button>
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
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  mode: PropTypes.oneOf(['default', 'alert', 'confirm']),
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onClose: PropTypes.func,
  buttons: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    style: PropTypes.oneOf(['default', 'primary', 'success', 'info', 'warning', 'danger', 'link']),
  }),
};
