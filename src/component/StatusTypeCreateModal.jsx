const React = require('react');

const Modal = require('./Modal');
const RichEditor = require('./RichEditor');

const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const HelpBlock = require('react-bootstrap/lib/HelpBlock');
const Row = require('react-bootstrap/lib/Row');
const Alert = require('react-bootstrap/lib/Alert');

const Api = require('../common/api');

class ValidationError {
  constructor(message) {
    this.message = message;
  }
}

class StatusTypeCreateModal extends React.Component {
  constructor(props) {
    super(props);
    const self = this;

    this.defaultData = Object.freeze({
      label: '',
      value: '',
      template: '',
    });

    this.modes = Object.freeze({
      add: {
        modalTitle: '새로운 알림 타입 등록',
        buttons: [
          { label: '저장', onClick: () => self.ensureSafeClick(() => self.save(false)), style: 'primary', disabled: false },
          { label: '닫기', onClick: (e, modal) => modal.close(true), disabled: false },
        ],
      },
      modify: {
        modalTitle: '알림 타입 업데이트',
        buttons: [
          { label: '업데이트', onClick: () => self.ensureSafeClick(() => self.save(false)), style: 'primary', disabled: false },
          { label: '닫기', onClick: (e, modal) => modal.close(true), disabled: false },
        ],
      },
    });

    this.state = {
      modalTitle: '새로운 알림 타입 등록',
      mode: 'add',
      saveWarningMessage: null,
      buttons: this.modes.add,
    };

    Object.assign(this.state, this.defaultData);
  }

  setButtonDisabled(disabled, callback) {
    const newButtonsState = this.state.buttons.map(button => Object.assign({}, button, { disabled }));
    this.setState({ buttons: newButtonsState }, callback);
  }

  checkFormValidity() {
    const data = this.state;
    // Check errors
    if (!data.label) {
      throw new ValidationError('상태 타입의 라벨을 설정해 주세요.');
    }
    if (!data.value) {
      throw new ValidationError('상태 타입의 값을 설정해 주세요.');
    }
    return true;
  }

  resolveData(data) {
    let newData = {};

    if (data) {
      newData = {
        id: data.id,
        label: data.label,
        value: data.value,
        template: data.template,
      };
    }
    this.setState(Object.assign({}, this.defaultData, newData));
  }

  save() {
    const self = this;

    return Promise.resolve()
      .then(() => this.checkFormValidity())
      .then(() => {
        const data = {
          label: this.state.label,
          value: this.state.value,
          template: this.state.template,
        };

        const api = (this.state.mode === 'add') ? Api.addStatusType(data) : Api.updateStatusType(this.state.id, data);
        return api.then(() => {
          self.props.onSuccess();
          return self.modal.close();
        }).catch((err) => {
          let message = '저장 도중 에러가 발생했습니다. 다시 시도해주세요.';
          if (err.response && err.response.data && err.response.data.message) {
            message = err.response.data.message;
          }
          self.modal.message(message, 'warning');
          throw err;
        });
      })
      .catch((error) => {
        if (error instanceof ValidationError) {
          self.modal.message(error.message, 'warning');
        }
        throw new Error(error);
      });
  }

  show(mode, data) {
    this.setState({ mode, saveWarningMessage: null, buttons: this.modes[mode].buttons });
    this.resolveData(data);
    this.modal.show();
  }

  ensureSafeClick(action) {
    this.setButtonDisabled(true,
      () => action()
        .then(() => this.setButtonDisabled(false))
        .catch(() => this.setButtonDisabled(false)),
    );
  }

  render() {
    return (
      <Modal
        title={this.modes[this.state.mode].modalTitle}
        ref={(modal) => { this.modal = modal; }}
        buttons={this.state.buttons}
      >
        <FormGroup controlId="label">
          <ControlLabel>상태 타입 라벨</ControlLabel>
          <FormControl
            componentClass="input"
            value={this.state.label}
            onChange={e => this.setState({ label: e.target.value })}
            placeholder="라벨"
          />
        </FormGroup>

        <FormGroup controlId="value">
          <ControlLabel>상태 타입 값</ControlLabel>
          <FormControl
            componentClass="input"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
            placeholder="값"
          />
        </FormGroup>

        <FormGroup controlId="template">
          <ControlLabel>상태 타입 템플릿</ControlLabel>
          <RichEditor
            value={this.state.template}
            onChange={template => this.setState({ template })}
            placeholder="템플릿"
          />
        </FormGroup>
        <Row>
          <HelpBlock>설정한 템플릿 내용은 새로운 알림을 생성할 때 알림 내용의 기본값으로 사용됩니다.</HelpBlock>
        </Row>
        <Alert style={{ display: this.state.saveWarningMessage ? 'block' : 'none' }} bsStyle="warning">
          {this.state.saveWarningMessage}
        </Alert>
      </Modal>
    );
  }
}

StatusTypeCreateModal.defaultProps = {
  onSuccess: () => {},
};

StatusTypeCreateModal.propTypes = {
  onSuccess: React.PropTypes.func,
};

module.exports = StatusTypeCreateModal;

