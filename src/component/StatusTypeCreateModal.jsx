import React from 'react';
import PropTypes from 'prop-types';

import {
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Row,
  Alert,
} from 'react-bootstrap';

import Modal from './Modal';
import RichEditor from './RichEditor';
import Api from '../common/api';
import ValidationField from './form/ValidationField';
import ValidationForm, { ValidationError } from './form/ValidationForm';

export default class StatusTypeCreateModal extends React.Component {
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
          { label: '닫기', disabled: false, isClose: true },
        ],
      },
      modify: {
        modalTitle: '알림 타입 업데이트',
        buttons: [
          { label: '업데이트', onClick: () => self.ensureSafeClick(() => self.save(false)), style: 'primary', disabled: false },
          { label: '닫기', disabled: false, isClose: true },
        ],
      },
    });

    this.state = {
      modalTitle: '새로운 알림 타입 등록',
      mode: 'add',
      saveWarningMessage: null,
      buttons: this.modes.add,
      message: '',
      messageLevel: 'warning',
    };

    Object.assign(this.state, this.defaultData);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.visible !== this.props.visible && newProps.visible) {
      this.setState({ saveWarningMessage: null, buttons: this.modes[newProps.mode].buttons });
      this.resolveData(newProps.data);
    }
  }

  setButtonDisabled(disabled, excludeCloseButton, callback) {
    const newButtonsState = this.state.buttons.map((button) => {
      return (excludeCloseButton && button.isClose) ? button : Object.assign({}, button, { disabled });
    });
    this.setState({ buttons: newButtonsState }, callback);
  }

  validateForm() {
    const isValid = this.form.validate();
    this.setButtonDisabled(!isValid, true);
  }

  validate(id) {
    const data = this.state;
    switch (id) {
      case 'label':
        if (!data.label) {
          throw new ValidationError('상태 타입의 라벨을 설정해 주세요.');
        }
        break;
      case 'value':
        if (!data.value) {
          throw new ValidationError('상태 타입의 값을 설정해 주세요.');
        }
        break;
      default:
        break;
    }
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
    this.setState(Object.assign({}, this.defaultData, newData), () => this.validateForm());
  }

  save() {
    const self = this;

    return Promise.resolve()
      .then(() => {
        const data = {
          label: this.state.label,
          value: this.state.value,
          template: this.state.template,
        };

        const api = (this.props.mode === 'add') ? Api.addStatusType(data) : Api.updateStatusType(this.state.id, data);
        return api.then(() => {
          self.props.onSuccess();
          return self.props.onClose();
        }).catch((err) => {
          let message = '저장 도중 에러가 발생했습니다. 다시 시도해주세요.';
          if (err.response && err.response.data && err.response.data.message) {
            message = err.response.data.message;
          }
          this.setState({ message });
          throw err;
        });
      })
      .catch((error) => {
        if (error instanceof ValidationError) {
          this.setState({ message: error.message });
        }
        throw new Error(error);
      });
  }

  ensureSafeClick(action) {
    this.setButtonDisabled(true, false,
      () => action()
        .then(() => this.setButtonDisabled(false))
        .catch(() => this.setButtonDisabled(false)),
    );
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title={this.modes[this.props.mode].modalTitle}
        buttons={this.state.buttons}
        onClose={() => this.props.onClose()}
      >
        <ValidationForm ref={(form) => { this.form = form; }}>
          <ValidationField
            controlId="label"
            required
            label="상태 타입 라벨"
            validate={() => this.validate('label')}
          >
            <FormControl
              componentClass="input"
              value={this.state.label}
              onChange={e => this.setState({ label: e.target.value }, () => this.validateForm())}
              placeholder="라벨"
            />
          </ValidationField>

          <ValidationField
            controlId="value"
            label="상태 타입 값"
            required
            validate={() => this.validate('value')}
          >
            <FormControl
              componentClass="input"
              value={this.state.value}
              onChange={e => this.setState({ value: e.target.value }, () => this.validateForm())}
              placeholder="값"
            />
          </ValidationField>

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
        </ValidationForm>
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
  visible: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'modify']).isRequired,
  data: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    template: PropTypes.string,
  }).isRequired,
};
