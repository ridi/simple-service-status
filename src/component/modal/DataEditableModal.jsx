import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import Modal from './Modal';
import { ValidationError } from '../form/ValidationForm';

export default class DataEditableModal extends React.Component {
  constructor(props, defaultData = {}, modes = {}) {
    super(props);

    this.defaultData = defaultData;
    this.modes = {
      add: {
        title: modes.add.title,
        buttons: [
          { label: modes.add.buttonLabel || '저장', onClick: () => this.ensureSafeClick(() => this.saveData()), style: 'primary', disabled: false },
          { label: '닫기', disabled: false, isClose: true },
        ],
      },
      modify: {
        title: modes.modify.title,
        buttons: [
          { label: modes.modify.buttonLabel || '수정', onClick: () => this.ensureSafeClick(() => this.saveData()), style: 'primary', disabled: false },
          { label: '닫기', disabled: false, isClose: true },
        ],
      },
    };
    this.state = {
      title: '등록',
      mode: 'add',
      buttons: this.modes.add.buttons,
      message: '',
      messageLevel: 'warning',
      saveWarningMessage: '',
      data: defaultData,
    };

    this.ignoreWarning = false; // TODO state로 관리, true일 경우 아예 warning을 발생 안 시키게
  }

  componentWillReceiveProps(props) {
    if (props.visible !== this.props.visible && props.visible) {
      this.setState({ saveWarningMessage: '', buttons: this.modes[props.mode].buttons });
      this.setData(props.data);
    }
  }

  /**
   * @abstract
   * @returns {object}
   */
  getData() {
    throw new Error('Should implement this method "getData()"');
  }

  /**
   * @abstract
   * @param {object} data
   * @return {object} newData
   */
  resolveData(data) {
    throw new Error('Should implement this method "resolveData()"');
  }

  /**
   * @abstract
   * @param {object} data
   * @returns {Promise}
   */
  doAdd(data) {
    throw new Error('Should implement this method "doAdd()"');
  }
  /**
   * @abstract
   * @param {string} id
   * @param {object} data
   * @returns {Promise}
   */
  doModify(id, data) {
    throw new Error('Should implement this method "doModify()"');
  }

  /**
   * @abstract
   * @returns {boolean}
   */
  doValidate() {
    throw new Error('Should implement this method "doValidate()"');
  }

  /**
   * @abstract
   */
  renderChild() {
    throw new Error('Should implement this method "renderChild()"');
  }

  checkData() {
    this.ignoreWarning = false;
    return Promise.resolve();
  }

  validate() {
    const isValid = this.doValidate();
    this.setButtonDisabled(!isValid, true);
  }

  setData(data) {
    const newData = this.resolveData(data);
    this.setState({ data: Object.assign({}, this.defaultData, newData) }, () => this.validate());
  }

  setDataField(field, doAfterSetData = () => {}) {
    const newData = Object.assign({}, this.state.data, field);
    this.setState({ data: newData }, () => {
      doAfterSetData();
      this.validate();
    });
  }

  setButtonDisabled(disabled, excludeCloseButton, callback) {
    const newButtonsState = this.state.buttons.map((button) => {
      return (excludeCloseButton && button.isClose) ? button : Object.assign({}, button, { disabled });
    });
    this.setState({ buttons: newButtonsState }, callback);
  }

  ensureSafeClick(action) {
    this.setButtonDisabled(true, false,
      () => action()
        .then(() => this.setButtonDisabled(false))
        .catch(() => this.setButtonDisabled(false)),
    );
  }

  saveData() {
    const data = this.getData();
    return Promise.resolve()
      .then(() => this.checkData())
      .then(() => (this.props.mode === 'add' ? this.doAdd(data) : this.doModify(this.state.data.id, data)))
      .then(() => {
        this.props.onSuccess();
        this.props.onClose();
      })
      .catch((error) => {
        if (error instanceof ValidationError) {
          if (error.level === 'error') {
            this.setState({ message: error.message });
          } else if (error.level === 'warning') {
            this.ignoreWarning = true;
            const message = (
              <p>
                저장하시기 전에 아래의 문제(들)를 확인해 주세요.
                <br />
                {error.message}
                <br />
                그래도 계속 하시려면 <strong>저장 버튼</strong>을 다시 누르세요.
              </p>
            );
            this.setState({ saveWarningMessage: message });
          }
        } else {
          let message = '저장 도중 에러가 발생했습니다. 다시 시도해주세요.';
          if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
          }
          this.setState({ message });
        }
        throw error;
      });
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title={this.modes[this.props.mode].title}
        buttons={this.state.buttons}
        message={this.state.message}
        messageLevel={this.state.messageLevel}
        onClose={() => this.props.onClose()}
      >
        { this.renderChild() }
        <Alert style={{ display: this.state.saveWarningMessage ? 'block' : 'none' }} bsStyle="warning">
          {this.state.saveWarningMessage}
        </Alert>
      </Modal>
    );
  }
}

DataEditableModal.defaultProps = {
  mode: 'add',
  data: null,
  onSuccess: () => {},
};

DataEditableModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['add', 'modify']),
  data: PropTypes.object,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
