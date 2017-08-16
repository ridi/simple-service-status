import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import {
  Row,
  Col,
  FormControl,
  ButtonToolbar,
  ButtonGroup,
  Button,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

const defaultCondition = { comparator: '*' };
const defaultConditionAdded = { comparator: '~' };

export default class VersionSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: [defaultCondition],
      addButtonDisabled: false,
    };
    this.focusInputs = {};
  }

  componentWillReceiveProps(newProps) {
    if (newProps.values) {
      this.setState({
        values: newProps.values,
        addButtonDisabled: newProps.values.some(val => val.comparator === '*'),
      });
    }
  }

  onVersionChanged(index, changedItem) {
    const newValues = this.state.values.slice();
    newValues[index] = Object.assign({}, this.state.values[index], changedItem);
    this.setState({
      values: newValues,
      addButtonDisabled: newValues.some(val => val.comparator === '*'),
    }, () => {
      if (changedItem.comparator && this.focusInputs[index][changedItem.comparator]) {
        ReactDOM.findDOMNode(this.focusInputs[index][changedItem.comparator]).focus();
      }
      this.onChanged();
    });
  }

  onChanged() {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.state.values);
    }
  }

  addCondition() {
    const newValues = this.state.values.slice();
    newValues.push(defaultConditionAdded);
    this.setState({ values: newValues }, () => this.onChanged());
  }

  removeCondition(idx) {
    const newValues = this.state.values.slice();
    newValues.splice(idx, 1);
    this.setState({ values: newValues }, () => this.onChanged());
  }

  render() {
    const values = this.state.values || [defaultCondition];  // default
    return (
      <div className="version-selector-container">
        {values.map((value, index) => {
          return (
            <div className="selector-item" key={index}>
              <ButtonToolbar className="selector-comparator">
                <ButtonGroup>
                  <OverlayTrigger placement="top" overlay={<Tooltip>모든 범위</Tooltip>}>
                    <Button
                      active={value.comparator === '*'}
                      onClick={() => this.onVersionChanged(index, { comparator: '*' })}
                      disabled={this.props.disabled}
                    >
                      &#x2731; {/* asterisk */}
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>범위 지정</Tooltip>}>
                    <Button
                      active={value.comparator === '~'}
                      onClick={() => this.onVersionChanged(index, { comparator: '~' })}
                      disabled={this.props.disabled}
                    >
                      &#x0223C; {/* tilda */}
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>일치</Tooltip>}>
                    <Button
                      active={value.comparator === '='}
                      onClick={() => this.onVersionChanged(index, { comparator: '=' })}
                      disabled={this.props.disabled} style={{ paddingTop: '5px', paddingBottom: '7px' }}
                    >
                      =
                    </Button>
                  </OverlayTrigger>
                </ButtonGroup>
              </ButtonToolbar>
              <FormControl
                className="selector-inputs"
                type="text"
                value={'모든 버전 대상'}
                style={value.comparator !== '*' ? { display: 'none' } : {}}
                readOnly
              />
              <FormControl
                ref={(f) => {
                  if (!this.focusInputs[index]) {
                    this.focusInputs[index] = {};
                  }
                  this.focusInputs[index]['~'] = f;
                }}
                className="selector-inputs"
                type="text"
                value={value.versionStart}
                onChange={e => this.onVersionChanged(index, { versionStart: e.target.value })}
                placeholder=">= 시작 버전 (X.Y.Z 형태)"
                disabled={this.props.disabled}
                style={value.comparator !== '~' ? { display: 'none' } : {}}
              />
              <FormControl
                className="selector-inputs selector-inputs-second"
                type="text"
                value={value.versionEnd}
                onChange={e => this.onVersionChanged(index, { versionEnd: e.target.value })}
                placeholder="< 끝 버전 (X.Y.Z 형태)"
                disabled={this.props.disabled}
                style={value.comparator !== '~' ? { display: 'none' } : {}}
              />
              <FormControl
                ref={(f) => {
                  if (!this.focusInputs[index]) {
                    this.focusInputs[index] = {};
                  }
                  this.focusInputs[index]['='] = f;
                }}
                className="selector-inputs"
                type="text"
                value={value.version}
                onChange={e => this.onVersionChanged(index, { version: e.target.value })}
                placeholder="= 일치하는 버전 (X.Y.Z 형태)"
                style={value.comparator !== '=' ? { display: 'none' } : {}}
                disabled={this.props.disabled}
              />
              <Button
                className="selector-remove-btn"
                onClick={() => this.removeCondition(index)}
                disabled={index === 0 || this.props.disabled}
              >
                &#x2715;
              </Button>
            </div>
          );
        })}
        <Row>
          <Col xs={12}>
            <Button
              className="selector-add-btn"
              onClick={() => this.addCondition()}
              disabled={this.props.disabled || this.state.addButtonDisabled}
            >
              + 조건 추가 (OR)
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

VersionSelector.propTypes = {
  values: PropTypes.arrayOf(PropTypes.shape({
    comparator: PropTypes.string.isRequired,
    versionStart: PropTypes.string,
    versionEnd: PropTypes.string,
    version: PropTypes.string,
  })),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};
