const React = require('react');

const Modal = require('./Modal');
const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const Select = require('react-select');

class CreateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.options = {
      types: [
        { label: '서버 문제', value: 'serverFailure' },
        { label: '정기 점검', value: 'routineInspection' }
      ],
      deviceTypes: [
        { label: 'Android', value: 'android' },
        { label: 'iOS', value: 'ios' },
        { label: 'Other', value: 'other' },
      ],
      comparators: [
        { label: '=', value: '=' },
        { label: '<', value: '<' },
        { label: '<=', value: '<=' },
        { label: '>', value: '>' },
        { label: '>=', value: '>=' },
      ],
    };
  }

  show() {
    this.modal.show();
  }

  render() {
    return (
      <Modal title="Add New Status" ref={(modal) => { this.modal = modal; }}>
        <FormGroup controlId="type">
          <ControlLabel>Type</ControlLabel>
          <FormControl type="text" value={this.state.type} placeholder="Type" />
        </FormGroup>
        <FormGroup controlId="deviceType">
          <ControlLabel>Device Type</ControlLabel>
          <FormControl type="text" value={this.state.deviceType} placeholder="Device Type" />
        </FormGroup>
        <FormGroup controlId="deviceVersionComparator">
          <ControlLabel>Device Version Comparator</ControlLabel>
          <FormControl type="text" value={this.state.deviceVersionComparator} placeholder="Device Version Comparator" />
        </FormGroup>
        <FormGroup controlId="deviceVersion">
          <ControlLabel>Device Version</ControlLabel>
          <FormControl type="text" value={this.state.deviceVersion} placeholder="Device Version" />
        </FormGroup>
        <FormGroup controlId="appVersionComparator">
          <ControlLabel>App Version Comparator</ControlLabel>
          <FormControl type="text" value={this.state.appVersionComparator} placeholder="App Version Comparator" />
        </FormGroup>
        <FormGroup controlId="appVersion">
          <ControlLabel>App Version</ControlLabel>
          <FormControl type="text" value={this.state.appVersion} placeholder="App Version" />
        </FormGroup>
        <FormGroup controlId="startTime">
          <ControlLabel>Start Time</ControlLabel>
          <FormControl type="text" value={this.state.startTime} placeholder="Start Time" />
        </FormGroup>
        <FormGroup controlId="endTime">
          <ControlLabel>Start Time</ControlLabel>
          <FormControl type="text" value={this.state.endTime} placeholder="End Time" />
        </FormGroup>
        <FormGroup controlId="content">
          <ControlLabel>Content</ControlLabel>
          <FormControl componentClass="textarea" value={this.state.content} placeholder="Content" />
        </FormGroup>
      </Modal>
    );
  }
}

module.exports = CreateModal;

