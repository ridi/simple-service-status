const React = require('react');
const ReactDOM = require('react-dom');

const Row = require('react-bootstrap/lib/Row');
const Col = require('react-bootstrap/lib/Col');
const FormControl = require('react-bootstrap/lib/FormControl');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
const Button = require('react-bootstrap/lib/Button');
const Glyphicon = require('react-bootstrap/lib/Glyphicon');

const defaultCondition = { comparator: '*' };

class VersionSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: [defaultCondition],
    };
    this.focusInputs = {};
  }

  componentWillReceiveProps(newProps) {
    if (newProps.values) {
      this.setState({ values: newProps.values });
    }
  }

  onVersionChanged(index, changedItem) {
    const newValues = this.state.values.slice();
    newValues[index] = Object.assign({}, this.state.values[index], changedItem);
    this.setState({ values: newValues }, () => {
      if (changedItem.comparator && this.focusInputs[changedItem.comparator]) {
        ReactDOM.findDOMNode(this.focusInputs[changedItem.comparator]).focus();
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
    newValues.push(defaultCondition);
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
            <div className="version-selector-item" key={index}>
              <ButtonToolbar className="version-selector-comparator">
                <ButtonGroup>
                  <Button
                    active={value.comparator === '*'}
                    onClick={() => this.onVersionChanged(index, { comparator: '*' })}
                    disabled={this.props.disabled}
                  >
                    &#x2731; {/* asterisk */}
                  </Button>
                  <Button
                    active={value.comparator === '~'}
                    onClick={() => this.onVersionChanged(index, { comparator: '~' })}
                    disabled={this.props.disabled}
                  >
                    &#x0223C; {/* tilda */}
                  </Button>
                  <Button
                    active={value.comparator === '='}
                    onClick={() => this.onVersionChanged(index, { comparator: '=' })}
                    disabled={this.props.disabled} style={{ paddingTop: '5px', paddingBottom: '7px' }}
                  >
                    =
                  </Button>
                </ButtonGroup>
              </ButtonToolbar>
              <FormControl
                className="version-selector-inputs"
                type="text"
                value={'모든 버전 대상'}
                style={value.comparator !== '*' ? { display: 'none' } : {}}
                readOnly
              />
              <FormControl
                ref={(f) => { this.focusInputs['~'] = f; }}
                className="version-selector-inputs"
                type="text"
                value={value.versionStart}
                onChange={e => this.onVersionChanged(index, { versionStart: e.target.value })}
                placeholder=">= 시작 버전"
                disabled={this.props.disabled}
                style={value.comparator !== '~' ? { display: 'none' } : {}}
              />
              <FormControl
                className="version-selector-inputs version-selector-inputs-second"
                type="text"
                value={value.versionEnd}
                onChange={e => this.onVersionChanged(index, { versionEnd: e.target.value })}
                placeholder="< 끝 버전"
                disabled={this.props.disabled}
                style={value.comparator !== '~' ? { display: 'none' } : {}}
              />
              <FormControl
                ref={(f) => { this.focusInputs['='] = f; }}
                className="version-selector-inputs"
                type="text"
                value={value.version}
                onChange={e => this.onVersionChanged(index, { version: e.target.value })}
                placeholder="= 일치하는 버전"
                style={value.comparator !== '=' ? { display: 'none' } : {}}
                disabled={this.props.disabled}
              />
              <Button className="version-selector-remove-btn" onClick={() => this.removeCondition(index)} disabled={index === 0 || this.props.disabled}>
                <Glyphicon glyph="remove" />
              </Button>
            </div>
          );
        })}
        <Row>
          <Col xs={12}>
            <Button className="version-selector-add-btn" onClick={() => this.addCondition()} disabled={this.props.disabled}>
              <Glyphicon glyph="plus" /> 조건 추가하기 (OR)
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

VersionSelector.propTypes = {
  values: React.PropTypes.arrayOf(React.PropTypes.shape({
    comparator: React.PropTypes.string.isRequired,
    versionStart: React.PropTypes.string,
    versionEnd: React.PropTypes.string,
    version: React.PropTypes.string,
  })),
  onChange: React.PropTypes.func,
  disabled: React.PropTypes.bool,
};

module.exports = VersionSelector;
