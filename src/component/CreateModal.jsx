const React = require('react');

const Modal = require('./Modal');
const VersionSelector = require('./VersionSelector');
const DateRangeSelector = require('./DateRangeSelector');
const RichEditor = require('./RichEditor');

const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const HelpBlock = require('react-bootstrap/lib/HelpBlock');
const Row = require('react-bootstrap/lib/Row');
const Alert = require('react-bootstrap/lib/Alert');

const Selectize = require('react-selectize');

const moment = require('moment');
const semver = require('semver');

const util = require('../common/common-util');
const dateUtil = require('../common/date-util');
const Api = require('../common/api');
const Joi = require('joi');

const SimpleSelect = Selectize.SimpleSelect;
const MultiSelect = Selectize.MultiSelect;

const EMPTY_CONTENTS_VALUE = '<p><br></p>';

class ValidationError {
  constructor(message) {
    this.message = message;
  }
}
class ValidationWarning {
  constructor(message) {
    this.message = message;
  }
}

class CreateModal extends React.Component {
  constructor(props) {
    super(props);
    const self = this;

    this.defaultData = Object.freeze({
      type: props.options.statusTypes[0],
      startTime: moment(),
      endTime: moment().add(2, 'hours'),
      deviceTypes: props.options.deviceTypes,
      title: '',
      contents: '',
      url: '',
      dateRange: { comparator: '~', startTime: moment(), endTime: moment().add(2, 'hours') },
      deviceSemVersion: [{ comparator: '*' }],
      appSemVersion: [{ comparator: '*' }],
    });

    this.modes = Object.freeze({
      add: {
        modalTitle: '새로운 알림 등록',
        buttons: [
          { label: '저장', onClick: () => self.ensureSafeClick(() => self.save(false)), style: 'primary', disabled: false },
          { label: '저장과 함께 활성화', onClick: () => self.ensureSafeClick(() => self.save(true)), disabled: false },
          { label: '닫기', onClick: (e, modal) => modal.close(true), disabled: false },
        ],
      },
      modify: {
        modalTitle: '알림 업데이트',
        buttons: [
          { label: '업데이트', onClick: () => self.ensureSafeClick(() => self.save(false)), style: 'primary', disabled: false },
          { label: '업데이트와 함께 활성화', onClick: () => self.ensureSafeClick(() => self.save(true)), disabled: false },
          { label: '닫기', onClick: (e, modal) => modal.close(true), disabled: false },
        ],
      },
    });

    this.state = {
      modalTitle: '새로운 알림 등록',
      mode: 'add',
      startTimeState: null,
      endTimeState: null,
      versionSelectorDisabled: false,
      saveWarningMessage: null,
      buttons: this.modes.add,
    };

    this.contentEditor = null;

    Object.assign(this.state, this.defaultData);
    this.ignoreWarning = false;
  }

  checkSemVersionValidity(parsedConditions) {
    let error;
    parsedConditions.some((cond) => { // for breaking, return true;
      if (cond.comparator === '~') {
        if (!cond.versionStart && !cond.versionEnd) {
          error = '"~"(범위) 조건을 지정한 경우 시작 버전 또는 종료 버전을 반드시 작성해야 합니다.';
          return true;
        }
        if (cond.versionStart && semver.valid(cond.versionStart) === null) {
          error = `${cond.versionStart}는 잘못된 버전 문자열입니다.`;
          return true;
        }
        if (cond.versionEnd && semver.valid(cond.versionEnd) === null) {
          error = `${cond.versionEnd}는 잘못된 버전 문자열입니다.`;
          return true;
        }
        if (cond.versionStart && cond.versionEnd && semver.gte(cond.versionStart, cond.versionEnd)) {
          error = `범위 조건에서 시작 버전(${cond.versionStart})은 종료 버전(${cond.versionEnd})보다 작은 값이어야 합니다.`;
        }
      }
      if (cond.comparator === '=') {
        if (!cond.version) {
          error = '"="(일치) 조건을 지정한 경우 버전을 반드시 작성해야 합니다.';
          return true;
        }
        if (cond.version && semver.valid(cond.version) === null) {
          error = `${cond.version}는 잘못된 버전 문자열입니다.`;
          return true;
        }
      }
      return false;
    });
    if (error) {
      throw new ValidationError(error);
    }
    return true;
  }

  save(withActivation) {
    const self = this;

    return Promise.resolve()
      .then(() => this.checkFormValidity(this.ignoreWarning))
      .then(() => {
        const data = {
          title: this.state.title,
          type: this.state.type.value,
          deviceTypes: this.state.deviceTypes.map(dt => dt.value),
          url: this.state.url,
          contents: this.state.contents,
          isActivated: withActivation,
          deviceSemVersion: (this.state.deviceTypes.length === 1) ? util.stringifySemVersion(this.state.deviceSemVersion) : '*',
          appSemVersion: (this.state.deviceTypes.length === 1) ? util.stringifySemVersion(this.state.appSemVersion) : '*',
        };
        if (this.state.dateRange.comparator === '~') {
          data.startTime = dateUtil.formatDate(this.state.dateRange.startTime);
          data.endTime = dateUtil.formatDate(this.state.dateRange.endTime);
        }

        this.ignoreWarning = false;

        const api = (this.state.mode === 'add') ? Api.addStatus(data) : Api.updateStatus(this.state.id, data);
        return api.then(() => {
          if (typeof self.props.onSuccess === 'function') {
            self.props.onSuccess();
          }
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
        } else if (error instanceof ValidationWarning) {
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
        throw new Error(error);
      });
  }

  show(mode, data) {
    this.setState({ mode, saveWarningMessage: null, buttons: this.modes[mode].buttons });
    this.resolveData(data);
    this.modal.show();
  }

  resolveData(data) {
    let newData = {};

    if (data) {
      newData = {
        id: data.id,
        title: data.title,
        type: this.props.options.statusTypes.find(o => o.value === data.type),
        deviceTypes: this.props.options.deviceTypes.filter(o => data.deviceTypes.includes(o.value)),
        dateRange: {
          comparator: (!data.startTime && !data.endTime) ? '*' : '~',
          startTime: moment(data.startTime),
          endTime: moment(data.endTime),
        },
        url: data.url,
        contents: data.contents,
        isActivated: data.isActivated,
        deviceSemVersion: util.parseSemVersion(data.deviceSemVersion),
        appSemVersion: util.parseSemVersion(data.appSemVersion),
      };
    }

    this.setState(Object.assign({}, this.defaultData, newData), () => this.onSelectionChanged());
  }

  onSelectionChanged() {
    this.setState({ versionSelectorDisabled: this.state.deviceTypes.length > 1 });
  }

  onDeviceTypesChanged(deviceTypes) {
    this.setState({ deviceTypes }, () => this.onSelectionChanged());
  }

  onStatusTypesChanged(type) {
    // 값이 변경될 때만 불리는 것이 아니라 클릭만 해도 불리기 때문에, 이전 상태값과의 비교가 필요.
    if (this.state.type !== type) {
      this.setState({ type });
      if (type.template && this.contentEditor) {
        this.contentEditor.setContent(type.template);
      }
    }
  }

  checkFormValidity(ignoreWarning) {
    const data = this.state;
    // Check errors
    if (!data.type) {
      throw new ValidationError('알림 타입을 설정해 주세요.');
    }
    if (data.dateRange.comparator === '~') {
      if (!data.dateRange.startTime) {
        throw new ValidationError('시작 일시를 지정해 주세요.');
      }
      if (!data.dateRange.endTime) {
        throw new ValidationError('종료 일시를 지정해 주세요.');
      }
      if (moment(data.dateRange.startTime).isAfter(data.dateRange.endTime)) {
        throw new ValidationError('종료 일시가 시작 일시보다 빠릅니다. 확인해 주세요.');
      }
    }
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('제목을 입력해 주세요.');
    }
    if (!data.contents || data.contents.trim().length === 0 || data.contents.trim() === EMPTY_CONTENTS_VALUE) {
      throw new ValidationError('내용을 입력해 주세요.');
    }
    if (data.deviceTypes.length === 0) {
      throw new ValidationError('디바이스 타입을 하나 이상 선택해 주세요.');
    }
    if (data.url) {
      if (Joi.validate(data.url, Joi.string().uri().allow('')).error) {
        throw new ValidationError('잘못된 URL 패턴입니다.');
      }
    }
    if (data.deviceTypes.length < 2) {
      this.checkSemVersionValidity(data.deviceSemVersion);
      this.checkSemVersionValidity(data.appSemVersion);
    }

    // Check warnings
    if (ignoreWarning) {
      return true;
    }
    const warning = [];
    if (data.dateRange.comparator === '~') {
      if (moment(data.dateRange.endTime).isBefore(moment.now())) {
        warning.push('- 설정된 종료 일시가 과거입니다. 활성화 하더라도 알림이 실행되지 않습니다.');
      }
    }
    if (data.deviceSemVersion.some(cond => cond.comparator === '*') && data.deviceSemVersion.length > 1) {
      warning.push('- 설정된 타겟 디바이스 버전 조건에 이미 \'*\'(모든 버전 대상)이 포함되어 있습니다. 저장 시 다른 조건들은 무시됩니다.');
    }
    if (data.appSemVersion.some(cond => cond.comparator === '*') && data.appSemVersion.length > 1) {
      warning.push('- 설정된 앱 버전 조건에 이미 \'*\'(모든 버전 대상)이 포함되어 있습니다. 저장 시 다른 조건들은 무시됩니다.');
    }
    if (warning.length > 0) {
      throw new ValidationWarning(warning.join(<br />));
    }
    return true;
  }

  setButtonDisabled(disabled, callback) {
    const newButtonsState = this.state.buttons.map(button => Object.assign({}, button, { disabled }));
    this.setState({ buttons: newButtonsState }, callback);
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
        <FormGroup controlId="type">
          <ControlLabel>알림 타입</ControlLabel>
          <SimpleSelect
            value={this.state.type}
            onValueChange={type => this.onStatusTypesChanged(type)}
            placeholder="알림 타입을 선택하세요"
            options={this.props.options.statusTypes}
          />
        </FormGroup>
        <FormGroup controlId="type">
          <ControlLabel>알림 시작/종료 일시</ControlLabel>
          <DateRangeSelector
            value={this.state.dateRange}
            onChange={(dateRange => this.setState({ dateRange }))}
          />
        </FormGroup>
        <Row>
          <HelpBlock>시작/종료 일시의 기본값은 현재부터 2시간으로 설정되어 있습니다.</HelpBlock>
        </Row>
        <FormGroup controlId="content">
          <ControlLabel>알림 내용</ControlLabel>
          <FormControl
            componentClass="input"
            value={this.state.title}
            onChange={e => this.setState({ title: e.target.value })}
            placeholder="제목"
          />
          <RichEditor
            ref={(e) => { this.contentEditor = e; }}
            value={this.state.contents}
            onChange={contents => this.setState({ contents })}
            placeholder="내용"
          />
        </FormGroup>

        <FormGroup controlId="deviceTypes">
          <ControlLabel>타겟 디바이스 타입</ControlLabel>
          <MultiSelect
            values={this.state.deviceTypes}
            onValuesChange={deviceTypes => this.onDeviceTypesChanged(deviceTypes)}
            placeholder="디바이스 타입을 선택하세요"
            options={this.props.options.deviceTypes}
          />
        </FormGroup>
        <Row>
          <HelpBlock>타겟 디바이스를 여러 개 선택할 경우 타겟 디바이스 버전과 앱 버전을 설정할 수 없습니다.</HelpBlock>
        </Row>
        <FormGroup controlId="deviceVersion" style={{ display: this.state.versionSelectorDisabled ? 'none' : 'block' }}>
          <ControlLabel>타겟 디바이스 버전</ControlLabel>
          <VersionSelector
            values={this.state.deviceSemVersion}
            onChange={(deviceSemVersion => this.setState({ deviceSemVersion }))}
            disabled={this.state.versionSelectorDisabled}
          />
        </FormGroup>
        <FormGroup controlId="appVersion" style={{ display: this.state.versionSelectorDisabled ? 'none' : 'block' }}>
          <ControlLabel>앱 버전</ControlLabel>
          <VersionSelector
            values={this.state.appSemVersion}
            onChange={(appSemVersion => this.setState({ appSemVersion }))}
            disabled={this.state.versionSelectorDisabled}
          />
        </FormGroup>
        <FormGroup controlId="content">
          <ControlLabel>관련 URL</ControlLabel>
          <FormControl
            componentClass="input"
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })}
            placeholder="관련 URL"
          />
        </FormGroup>
        <Alert style={{ display: this.state.saveWarningMessage ? 'block' : 'none' }} bsStyle="warning">
          {this.state.saveWarningMessage}
        </Alert>
      </Modal>
    );
  }
}

CreateModal.propTypes = {
  options: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.objectOf(React.PropTypes.string))),
};

module.exports = CreateModal;

