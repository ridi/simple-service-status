import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  HelpBlock,
  Row,
  FormGroup,
  ControlLabel,
  ButtonToolbar,
  ToggleButtonGroup,
  ToggleButton,
} from 'react-bootstrap';
import { SimpleSelect, MultiSelect } from 'react-selectize';
import moment from 'moment';
import semver from 'semver';
import dateUtil from '../../common/date-util';
import BaseDataEditableModal from './BaseDataEditableModal';
import VersionSelector from '../form/VersionSelector';
import DateRangeSelector from '../form/DateRangeSelector';
import RichEditor from '../form/RichEditor';
import util from '../../common/common-util';
import Api from '../../common/api';
import ValidationField from '../form/ValidationField';
import ValidationForm, { ValidationError } from '../form/ValidationForm';

const EMPTY_CONTENTS_VALUE = '<p><br></p>';

export default class StatusModal extends BaseDataEditableModal {
  constructor(props) {
    super(
      props,
      {
        type: props.options.statusTypes[0],
        startTime: moment(),
        endTime: moment().add(2, 'hours'),
        deviceTypes: props.options.deviceTypes,
        title: '',
        contents: props.options.statusTypes[0].template || '',
        dateRange: { comparator: '~', startTime: moment(), endTime: moment().add(2, 'hours') },
        deviceSemVersion: [{ comparator: '*' }],
        appSemVersion: [{ comparator: '*' }],
      },
      {
        add: { title: '새로운 알림 등록' },
        modify: { title: '알림 수정' },
      },
    );

    this.state = Object.assign({}, this.state, { versionSelectorDisabled: true });

    this.contentEditor = null;
    this.form = null;
  }

  getData() {
    const data = this.state.data;

    const result = {
      title: data.title,
      type: data.type.value,
      deviceTypes: data.deviceTypes.map(dt => dt.value),
      contents: data.contents,
      isActivated: !!data.isActivated,
      deviceSemVersion: (data.deviceTypes.length === 1) ? util.stringifySemVersion(data.deviceSemVersion) : '*',
      appSemVersion: (data.deviceTypes.length === 1) ? util.stringifySemVersion(data.appSemVersion) : '*',
    };
    if (data.dateRange.comparator === '~') {
      result.startTime = dateUtil.formatDate(data.dateRange.startTime);
      result.endTime = dateUtil.formatDate(data.dateRange.endTime);
    }
    return result;
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
        contents: data.contents,
        isActivated: false,
        deviceSemVersion: util.parseSemVersion(data.deviceSemVersion),
        appSemVersion: util.parseSemVersion(data.appSemVersion),
      };
    }

    return newData;
  }

  setData(data) {
    const newData = this.resolveData(data);
    this.setState({ data: Object.assign({}, this.defaultData, newData) }, () => {
      this.onSelectionChanged();
      this.validate();
    });
  }

  doAdd(data) {
    return Api.addStatus(data);
  }

  doModify(id, data) {
    return Api.updateStatus(id, data);
  }

  doValidate() {
    return this.form.validate();
  }

  onSelectionChanged() {
    this.setState({ versionSelectorDisabled: this.state.data.deviceTypes.length > 1 });
  }

  onDeviceTypesChanged(deviceTypes) {
    this.setDataField({ deviceTypes }, () => this.onSelectionChanged());
  }

  onStatusTypesChanged(type) {
    // 값이 변경될 때만 불리는 것이 아니라 클릭만 해도 불리기 때문에, 이전 상태값과의 비교가 필요.
    if (this.state.type !== type) {
      this.setDataField({ type });
      if (type && type.template && this.contentEditor) {
        this.contentEditor.setContent(type.template);
      }
    }
  }

  _checkSemVersionValidity(parsedConditions) {
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

  validateField(id) {
    const data = this.state.data;
    switch (id) {
      case 'type':
        if (!data.type) {
          throw new ValidationError('알림 타입을 설정해 주세요.');
        }
        break;
      case 'dateRange':
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
        break;
      case 'content':
        if (!data.title || data.title.trim().length === 0) {
          throw new ValidationError('제목을 입력해 주세요.');
        }
        if (!data.contents || data.contents.trim().length === 0 || data.contents.trim() === EMPTY_CONTENTS_VALUE) {
          throw new ValidationError('내용을 입력해 주세요.');
        }
        break;
      case 'deviceTypes':
        if (data.deviceTypes.length === 0) {
          throw new ValidationError('디바이스 타입을 하나 이상 선택해 주세요.');
        }
        break;
      case 'deviceVersion':
        if (data.deviceTypes.length < 2) {
          this._checkSemVersionValidity(data.deviceSemVersion);
        }
        break;
      case 'appVersion':
        if (data.deviceTypes.length < 2) {
          this._checkSemVersionValidity(data.appSemVersion);
        }
        break;
      default:
        break;
    }
  }

  checkData() {
    const data = this.state.data;

    // Check warnings
    if (this.ignoreWarning) {
      return true;
    }
    const warnings = [];
    if (data.dateRange.comparator === '~') {
      if (moment(data.dateRange.endTime).isBefore(moment.now())) {
        warnings.push('설정된 종료 일시가 과거입니다. 활성화 하더라도 알림이 실행되지 않습니다.');
      }
    }
    if (data.deviceSemVersion.some(cond => cond.comparator === '*') && data.deviceSemVersion.length > 1) {
      warnings.push('설정된 타겟 디바이스 버전 조건에 이미 \'*\'(모든 버전 대상)이 포함되어 있습니다. 저장 시 다른 조건들은 무시됩니다.');
    }
    if (data.appSemVersion.some(cond => cond.comparator === '*') && data.appSemVersion.length > 1) {
      warnings.push('설정된 앱 버전 조건에 이미 \'*\'(모든 버전 대상)이 포함되어 있습니다. 저장 시 다른 조건들은 무시됩니다.');
    }
    if (warnings.length > 0) {
      throw new ValidationError(warnings.join('\n'), 'warning');
    }
    return true;
  }

  renderChild() {
    return (
      <ValidationForm ref={(f) => { this.form = f; }}>
        <FormGroup controlId="isActivated">
          <ControlLabel>
            알림 활성화 <sup>&#x2731;</sup>
          </ControlLabel>
          <ButtonToolbar>
            <ToggleButtonGroup
              type="radio"
              name="isActivated"
              value={this.state.data.isActivated ? 2 : 1}
              defaultValue={1}
              onChange={() => { /* 버그로 인해 호출되지 않으므로 사용하지 않음 */ }}
            >
              <ToggleButton value={2} onClick={() => this.setDataField({ isActivated: true })}>ON</ToggleButton>
              <ToggleButton value={1} onClick={() => this.setDataField({ isActivated: false })}>OFF</ToggleButton>
            </ToggleButtonGroup>
          </ButtonToolbar>
        </FormGroup>
        <ValidationField controlId="type" label="알림 타입" required validate={() => this.validateField('type')}>
          <FormControl
            componentClass={SimpleSelect}
            value={this.state.data.type}
            onValueChange={type => this.onStatusTypesChanged(type)}
            placeholder="알림 타입을 선택하세요"
            options={this.props.options.statusTypes}
          />
        </ValidationField>
        <ValidationField
          controlId="dateRange"
          label="알림 시작 / 종료 일시"
          required
          validate={() => this.validateField('dateRange')}
        >
          <FormControl
            componentClass={DateRangeSelector}
            value={this.state.data.dateRange}
            onChange={dateRange => this.setDataField({ dateRange })}
          />
        </ValidationField>
        <Row>
          <HelpBlock>시작/종료 일시의 기본값은 현재부터 2시간으로 설정되어 있습니다.</HelpBlock>
        </Row>
        <ValidationField
          controlId="content"
          required
          label="알림 내용"
          validate={() => this.validateField('content')}
        >
          <FormControl
            componentClass="input"
            value={this.state.data.title}
            onChange={e => this.setDataField({ title: e.target.value })}
            placeholder="제목"
          />
          <FormControl
            componentClass={RichEditor}
            inputRef={(e) => { this.contentEditor = e; }}
            value={this.state.data.contents}
            onChange={contents => this.setDataField({ contents })}
            placeholder="내용"
          />
        </ValidationField>
        <ValidationField
          controlId="deviceTypes"
          label="타겟 디바이스 타입"
          required
          validate={() => this.validateField('deviceTypes')}
        >
          <FormControl
            componentClass={MultiSelect}
            values={this.state.data.deviceTypes}
            onValuesChange={deviceTypes => this.onDeviceTypesChanged(deviceTypes)}
            placeholder="디바이스 타입을 선택하세요"
            options={this.props.options.deviceTypes}
            renderValue={item => (
              <div className="simple-value item-removable">
                <span>{item.label}</span>
                <button
                  onClick={() => this.onDeviceTypesChanged(this.state.data.deviceTypes.filter(t => t.value !== item.value))}
                >x</button>
              </div>
            )}
          />
        </ValidationField>
        <Row>
          <HelpBlock>타겟 디바이스를 여러 개 선택할 경우 타겟 디바이스 버전과 앱 버전을 설정할 수 없습니다.</HelpBlock>
        </Row>
        <ValidationField
          controlId="deviceVersion"
          style={{ display: this.state.versionSelectorDisabled ? 'none' : 'block' }}
          label="타겟 디바이스 버전"
          required
          validate={() => this.validateField('deviceVersion')}
        >
          <FormControl
            componentClass={VersionSelector}
            values={this.state.data.deviceSemVersion}
            onChange={(deviceSemVersion => this.setDataField({ deviceSemVersion }))}
            disabled={this.state.versionSelectorDisabled}
          />
        </ValidationField>
        <ValidationField
          controlId="appVersion"
          style={{ display: this.state.versionSelectorDisabled ? 'none' : 'block' }}
          label="앱 버전"
          required
          validate={() => this.validateField('appVersion')}
        >
          <FormControl
            componentClass={VersionSelector}
            values={this.state.data.appSemVersion}
            onChange={(appSemVersion => this.setDataField({ appSemVersion }))}
            disabled={this.state.versionSelectorDisabled}
          />
        </ValidationField>
      </ValidationForm>
    );
  }
}

StatusModal.defaultProps = {
  options: {},
  onSuccess: () => {},
  data: null,
};

StatusModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  options: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string))),
  onSuccess: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    deviceTypes: PropTypes.array,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    contents: PropTypes.string,
    isActivated: PropTypes.bool,
    deviceSemVersion: PropTypes.string,
    appSemVersion: PropTypes.string,
  }),
  mode: PropTypes.oneOf(['add', 'modify']).isRequired,
};
