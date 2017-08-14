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
      alertMessage: null,
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.visible !== this.props.visible && newProps.visible) {
      this.setState({ alertMessage: null });
    }
  }

  close(isCancel) {
    if (isCancel) {
      if (this.props.onCancel) {
        this.props.onCancel();
      }
    }
    this.props.onClose();
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

    return (
      <RBModal show={this.props.visible} onHide={() => this.close(true)} bsSize={this.props.size} backdrop="static">
        <RBModal.Header closeButton>
          <RBModal.Title>{this.props.title}</RBModal.Title>
        </RBModal.Header>
        <RBModal.Body>
          <Alert style={{ display: this.props.message ? 'block' : 'none' }} bsStyle={this.props.messageLevel}>
            {this.props.message}
          </Alert>
          {this.props.children}
        </RBModal.Body>
        <RBModal.Footer>
          {this.props.buttons instanceof Array && this.props.buttons.map(button => (
            <Button
              onClick={e => (button.isClose ? this.close(true) : button.onClick(e, modal))}
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
  size: MODE_PRESET.default.size,
  onConfirm: () => {},
  onCancel: () => {},
  buttons: MODE_PRESET.default.buttons,
  message: '',
  messageLevel: 'warning',
};

Modal.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  mode: PropTypes.oneOf(['default', 'alert', 'confirm']),
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    style: PropTypes.oneOf(['default', 'primary', 'success', 'info', 'warning', 'danger', 'link']),
  })),
  message: PropTypes.string,
  messageLevel: PropTypes.string,
};
