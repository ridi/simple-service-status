const React = require('react');

const Modal = require('./Modal');
const VersionSelector = require('./VersionSelector');
const DateRangeSelector = require('./DateRangeSelector');

const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const HelpBlock = require('react-bootstrap/lib/HelpBlock');
const Row = require('react-bootstrap/lib/Row');
const Alert = require('react-bootstrap/lib/Alert');

const Selectize = require('react-selectize');

const moment = require('moment');
const semver = require('semver');

const util = require('../common/util');
const Api = require('../common/api');

const SimpleSelect = Selectize.SimpleSelect;
const MultiSelect = Selectize.MultiSelect;

class CreateModal extends React.Component {
  constructor(props) {
    super(props);
    const self = this;

    this.defaultData = Object.freeze({
      type: props.options.statusTypes[0],
      startTime: moment(),
      endTime: moment().add(2, 'hours'),
      deviceTypes: [],
      contents: '',
      dateRange: { comparator: '~', startTime: moment(), endTime: moment().add(2, 'hours') },
      deviceSemVersion: [{ comparator: '*' }],
      appSemVersion: [{ comparator: '*' }],
    });

    this.state = {
      title: '새로운 알림 등록',
      mode: 'add',
      startTimeState: null,
      endTimeState: null,
      versionSelectorDisabled: false,
      saveWarningMessage: null,
    };

    Object.assign(this.state, this.defaultData);
    this.checkWarningOnce = false;
    this.modes = {
      add: {
        title: '새로운 알림 등록',
        buttons: [
          { label: '저장', onClick: (e, modal) => self.onSave(false, modal), style: 'primary' },
          { label: '저장과 함께 활성화', onClick: (e, modal) => self.onSave(true, modal) },
          { label: '닫기', onClick: (e, modal) => modal.close(true) },
        ],
      },
      modify: {
        title: '알림 업데이트',
        buttons: [
          { label: '업데이트', onClick: (e, modal) => self.onSave(false, modal), style: 'primary' },
          { label: '업데이트와 함께 활성화', onClick: (e, modal) => self.onSave(true, modal) },
          { label: '닫기', onClick: (e, modal) => modal.close(true) },
        ],
      },
    };
  }

  checkFormValidity() {
    const data = this.state;
    const warning = [];

    if (!data.type) {
      return { error: '알림 타입을 설정해 주세요.' };
    }
    if (data.dateRange.comparator === '~') {
      if (!data.dateRange.startTime) {
        return { error: '시작 일시를 지정해 주세요.' };
      }
      if (!data.dateRange.endTime) {
        return { error: '종료 일시를 지정해 주세요.' };
      }
      if (moment(data.dateRange.startTime).isAfter(data.dateRange.endTime)) {
        return { error: '종료 일시가 시작 일시보다 빠릅니다. 확인해 주세요.' };
      }
      if (moment(data.dateRange.endTime).isBefore(moment.now())) {
        warning.push('- 설정된 종료 일시가 과거입니다. 활성화 하더라도 알림이 실행되지 않습니다.');
      }
    }
    if (data.deviceTypes.length === 0) {
      return { error: '디바이스 타입을 하나 이상 선택해 주세요.' };
    }
    if (data.contents.trim().length === 0) {
      return { error: '내용을 입력해 주세요.' };
    }
    if (data.deviceTypes.length < 2) {
      let semVersionValidity = this.checkSemVersionValidity(data.deviceSemVersion);
      if (semVersionValidity !== true) {
        return { error: semVersionValidity };
      }
      semVersionValidity = this.checkSemVersionValidity(data.appSemVersion);
      if (semVersionValidity !== true) {
        return { error: semVersionValidity };
      }
    }

    if (data.deviceSemVersion.some(cond => cond.comparator === '*') && data.deviceSemVersion.length > 1) {
      warning.push('- 설정된 타겟 디바이스 버전 조건에 이미 \'*\'(모든 버전 대상)이 포함되어 있습니다. 저장 시 다른 조건들은 무시됩니다.');
    }
    if (data.appSemVersion.some(cond => cond.comparator === '*') && data.appSemVersion.length > 1) {
      warning.push('- 설정된 앱 버전 조건에 이미 \'*\'(모든 버전 대상)이 포함되어 있습니다. 저장 시 다른 조건들은 무시됩니다.');
    }
    if (warning.length === 0) {
      return true;
    }
    return { warning };
  }

  checkSemVersionValidity(parsedConditions) {
    let result = true;
    parsedConditions.some((cond) => { // for breaking, return true;
      if (cond.comparator === '~') {
        if (!cond.versionStart && !cond.versionEnd) {
          result = '"~"(범위) 조건을 지정한 경우 시작 버전 또는 종료 버전을 반드시 작성해야 합니다.';
          return true;
        }
        if (cond.versionStart && semver.valid(cond.versionStart) === null) {
          result = `${cond.versionStart}는 잘못된 버전 문자열입니다.`;
          return true;
        }
        if (cond.versionEnd && semver.valid(cond.versionEnd) === null) {
          result = `${cond.versionEnd}는 잘못된 버전 문자열입니다.`;
          return true;
        }
        if (cond.versionStart && cond.versionEnd && semver.gte(cond.versionStart, cond.versionEnd)) {
          result = `범위 조건에서 시작 버전(${cond.versionStart})은 종료 버전(${cond.versionEnd})보다 작은 값이어야 합니다.`;
        }
      }
      if (cond.comparator === '=') {
        if (!cond.version) {
          result = '"="(일치) 조건을 지정한 경우 버전을 반드시 작성해야 합니다.';
          return true;
        }
        if (cond.version && semver.valid(cond.version) === null) {
          result = `${cond.version}는 잘못된 버전 문자열입니다.`;
          return true;
        }
      }
      return false;
    });
    return result;
  }

  onSave(withActivation) {
    const self = this;

    const result = this.checkFormValidity();
    if (result !== true) {
      if (result.error) {
        this.modal.message(result.error, 'warning');
        return;
      } else if (result.warning && !this.checkWarningOnce) {
        this.checkWarningOnce = true;
        const message = (
          <p>
            저장하시기 전에 아래의 문제(들)를 확인해 주세요.
            <br />
            {result.warning.join(<br />)}
            <br />
            그래도 계속 하시려면 <strong>저장 버튼</strong>을 다시 누르세요.
          </p>
        );
        this.setState({ saveWarningMessage: message });
        return;
      }
    }

    const data = {
      type: this.state.type.value,
      deviceTypes: this.state.deviceTypes.map(dt => dt.value),
      contents: this.state.contents,
      isActivated: withActivation,
      deviceSemVersion: (this.state.deviceTypes.length === 1) ? util.stringifySemVersion(this.state.deviceSemVersion) : '*',
      appSemVersion: (this.state.deviceTypes.length === 1) ? util.stringifySemVersion(this.state.appSemVersion) : '*',
    };
    if (this.state.dateRange.comparator === '~') {
      data.startTime = util.formatDate(this.state.dateRange.startTime);
      data.endTime = util.formatDate(this.state.dateRange.endTime);
    }

    this.checkWarningOnce = false;
    const api = (this.state.mode === 'add') ? Api.addStatus(data) : Api.updateStatus(this.state.id, data);

    api.then((response) => {
      if (typeof self.props.onSuccess === 'function') {
        self.props.onSuccess();
      }
      self.modal.close();
    }).catch(() => self.modal.message('저장 도중 에러가 발생했습니다. 다시 시도해주세요.', 'warning'));
  }

  show(mode, data) {
    this.setState({ mode, saveWarningMessage: null });
    this.resolveData(data);
    this.modal.show();
  }

  resolveData(data) {
    let newData = {};

    if (data) {
      newData = {
        id: data.id,
        type: this.props.options.statusTypes.find(o => o.value === data.type),
        deviceTypes: this.props.options.deviceTypes.filter(o => data.deviceTypes.includes(o.value)),
        dateRange: {
          comparator: (!data.startTime && !data.endTime) ? '*' : '~',
          startTime: moment(data.startTime),
          endTime: moment(data.endTime),
        },
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

  render() {
    return (
      <Modal
        title={this.modes[this.state.mode].title}
        ref={(modal) => { this.modal = modal; }}
        buttons={this.modes[this.state.mode].buttons}
      >
        <FormGroup controlId="type">
          <ControlLabel>알림 타입</ControlLabel>
          <SimpleSelect
            value={this.state.type}
            onValueChange={type => this.setState({ type })}
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
          <ControlLabel>내용</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={this.state.contents}
            onChange={e => this.setState({ contents: e.target.value })}
            placeholder="Content"
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

