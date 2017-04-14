import React from 'react';
import PropTypes from 'prop-types';

import {
  FormControl,
  ButtonToolbar,
  ButtonGroup,
  Button,OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

import DateTime from 'react-datetime';

const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm';
const defaultCondition = { comparator: '~' };

export default class DateRangeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: defaultCondition,
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.value) {
      this.setState({ value: newProps.value });
    }
  }

  onDateChanged(changedItem) {
    const newState = {
      value: Object.assign({}, this.state.value, changedItem),
    };
    this.setState(newState, () => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(this.state.value);
      }
    });
  }

  render() {
    const value = this.state.value || defaultCondition;  // default
    return (
      <div className="date-range-selector-container">
        <div className="selector-item">
          <ButtonToolbar className="selector-comparator">
            <ButtonGroup>
              <OverlayTrigger placement="top" overlay={<Tooltip>모든 범위</Tooltip>}>
                <Button
                  active={value.comparator === '*'}
                  onClick={() => this.onDateChanged({ comparator: '*' })}
                  disabled={this.props.disabled}
                >
                  &#x2731; {/* asterisk */}
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement="top" overlay={<Tooltip>범위 지정</Tooltip>}>
                <Button
                  active={value.comparator === '~'}
                  onClick={() => this.onDateChanged({ comparator: '~' })}
                  disabled={this.props.disabled}
                >
                  &#x0223C; {/* tilda */}
                </Button>
              </OverlayTrigger>
            </ButtonGroup>
          </ButtonToolbar>
          <FormControl
            className="selector-inputs"
            type="text"
            value={'모든 기간 대상'}
            style={value.comparator !== '*' ? { display: 'none' } : {}}
            readOnly
          />
          <div className="selector-inputs-container" style={value.comparator !== '~' ? { display: 'none' } : {}}>
            <DateTime
              className="selector-inputs"
              value={value.startTime}
              inputProps={{ placeholder: '시작 일시' }}
              dateFormat={dateFormat}
              timeFormat={timeFormat}
              onChange={startTime => this.onDateChanged({ startTime })}
              disabled={this.props.disabled}
              closeOnSelect
            />
            <DateTime
              className="selector-inputs selector-inputs-second"
              value={value.endTime}
              inputProps={{ placeholder: '종료 일시' }}
              dateFormat={dateFormat}
              timeFormat={timeFormat}
              onChange={endTime => this.onDateChanged({ endTime })}
              disabled={this.props.disabled}
              closeOnSelect
            />
          </div>
        </div>
      </div>
    );
  }
}

DateRangeSelector.propTypes = {
  value: PropTypes.shape({
    comparator: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};
