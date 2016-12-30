const React = require('react');

const Modal = require('./Modal');
const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const HelpBlock = require('react-bootstrap/lib/HelpBlock');
const Row = require('react-bootstrap/lib/Row');
const Col = require('react-bootstrap/lib/Col');

const Selectize = require('react-selectize');
const DateTime = require('react-datetime');

const moment = require('moment');
const axios = require('axios');

const SimpleSelect = Selectize.SimpleSelect;
const MultiSelect = Selectize.MultiSelect;

moment.locale('ko-kr');
const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm';

const options = {
  types: [],
  deviceTypes: [
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' },
    { label: 'Other', value: 'other' },
  ],
  comparators: [
    { label: 'All', value: '*' },
    { label: '= (Equal)', value: '=' },
    { label: '< (Less Than)', value: '<' },
    { label: '<= (Less Than or Equal)', value: '<=' },
    { label: '> (Greater Than)', value: '>' },
    { label: '>= (Greater Than or Equal)', value: '>=' },
  ],
};

class CreateModal extends React.Component {
  constructor(props) {
    super(props);
    const self = this;

    options.types = this.props.statusTypes;

    const defaultData = {
      type: options.types[0],
      startTime: moment(),
      endTime: moment().add(2, 'hours'),
      deviceType: [],
      deviceVersionComparator: options.comparators[0],
      deviceVersion: '',
      appVersionComparator: options.comparators[0],
      appVersion: '',
      contents: '',
    };

    this.state = {
      startTimeState: null,
      endTimeState: null,
      deviceVersionDisabled: true,
      appVersionDisabled: true,
    };

    Object.assign(this.state, defaultData, props.initialData || {});

    this.buttons = [
      { label: '저장', onClick: (e, modal) => self.onSave(false, modal), style: 'primary' },
      { label: '저장과 함께 활성화', onClick: (e, modal) => self.onSave(true, modal) },
    ];
  }

  onSave(withActivation, modal) {
    const self = this;
    const data = {
      type: this.state.type.value,
      deviceType: this.state.deviceType.map(dt => dt.value),
      deviceVersion: [this.state.deviceVersionComparator.value]
        .concat((this.state.deviceVersionComparator.value !== '*' && this.state.deviceVersion) ? this.state.deviceVersion.split('.') : []),
      appVersion: [this.state.appVersionComparator.value]
        .concat((this.state.appVersionComparator.value !== '*' && this.state.appVersion) ? this.state.appVersion.split('.') : []),
      startTime: this.state.startTime.format(`${dateFormat} ${timeFormat}`),
      endTime: this.state.endTime.format(`${dateFormat} ${timeFormat}`),
      contents: this.state.contents,
      isActivated: withActivation,
    };

    console.log(data, modal);

    axios.post('/api/v1/status', data).then(response => {
      if (typeof self.props.onSuccess === 'function') {
        self.props.onSuccess();
      }
      self.modal.close();
      console.log(`Add Status Success: ${response}`);
    }).catch(err => self.modal.alert('저장 도중 에러가 발생했습니다. 다시 시도해주세요.', 'warning'));
  }

  show() {
    this.modal.show();
  }

  onStartTimeChanged(startTime) {
    this.setState({ startTime });
    if (this.state.endTime.isSameOrBefore(startTime)) {
      this.setState({ endTimeState: 'error' });
      return;
    }
    this.setState({ endTimeState: null });
  }

  onEndTimeChanged(endTime) {
    if (typeof endTime === 'string' || endTime.isSameOrBefore(this.state.startTime)) {
      this.setState({ endTime, endTimeState: 'error' });
      return;
    }
    this.setState({ endTime, endTimeState: null });
  }

  isValidRange(startTime, endTime) {
    if (!startTime || !endTime) {
      return true;
    }
    return moment(startTime).isBefore(endTime);
  }

  onComparatorChanged(selected, target) {
    this.setState({ [`${target}Disabled`]: (!selected || selected.value === '*') });
    this.setState({ [`${target}Comparator`]: selected });
  }

  render() {
    return (
      <Modal title="새로운 알람 등록" ref={(modal) => { this.modal = modal; }} buttons={this.buttons}>
        <FormGroup controlId="type">
          <ControlLabel>알람 타입</ControlLabel>
          <SimpleSelect value={this.state.type} onValueChange={type => this.setState({ type })} placeholder="알람 타입을 선택하세요" options={options.types} />
        </FormGroup>
        <Row>
          <Col xs={6}>
            <FormGroup validationState={this.state.startTimeState}>
              <ControlLabel>시작일시</ControlLabel>
              <DateTime
                value={this.state.startTime}
                placeholder="Start Time"
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                onChange={startTime => this.onStartTimeChanged(startTime)}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup validationState={this.state.endTimeState}>
              <ControlLabel>종료일시</ControlLabel>
              <DateTime
                value={this.state.endTime}
                placeholder="End Time"
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                isValidDate={current => this.isValidRange(this.state.startTime, current)}
                onChange={endTime => this.onEndTimeChanged(endTime)}
                onBlur={endTime => this.onEndTimeChanged(endTime)}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <HelpBlock>시작/종료일시의 기본값은 현재부터 2시간으로 설정되어 있습니다.</HelpBlock>
        </Row>
        <FormGroup controlId="deviceType">
          <ControlLabel>타겟 디바이스 타입</ControlLabel>
          <MultiSelect
            value={this.state.deviceType}
            onValuesChange={deviceType => this.setState({ deviceType })}
            placeholder="디바이스 타압을 선택하세요"
            options={options.deviceTypes}
          />
        </FormGroup>
        <FormGroup controlId="deviceVersionComparator">
          <ControlLabel>타겟 디바이스 버전</ControlLabel>
          <Row>
            <Col xs={6}>
              <SimpleSelect
                value={this.state.deviceVersionComparator}
                onValueChange={deviceVersionComparator => this.onComparatorChanged(deviceVersionComparator, 'deviceVersion')}
                options={options.comparators}
              />
            </Col>
            <Col xs={6}>
              <FormControl
                type="text"
                value={this.state.deviceVersion}
                onChange={e => this.setState({ deviceVersion: e.target.value })}
                placeholder="Device Version"
                disabled={this.state.deviceVersionDisabled}
              />
            </Col>
          </Row>
        </FormGroup>
        <FormGroup controlId="appVersion">
          <ControlLabel>앱 버전</ControlLabel>
          <Row>
            <Col xs={6}>
              <SimpleSelect
                value={this.state.appVersionComparator}
                onValueChange={appVersionComparator => this.onComparatorChanged(appVersionComparator, 'appVersion')}
                options={options.comparators}
              />
            </Col>
            <Col xs={6}>
              <FormControl
                type="text"
                value={this.state.appVersion}
                onChange={e => this.setState({ appVersion: e.target.value })}
                placeholder="App Version"
                disabled={this.state.appVersionDisabled}
              />
            </Col>
          </Row>
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
      </Modal>
    );
  }
}

module.exports = CreateModal;

