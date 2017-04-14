import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
} from 'react-bootstrap';

export default class ValidationField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      validation: 'success',
      feedback: '',
    };
  }

  componentWillMount() {
    if (this.context) {
      this.context.addField(this);
    }
  }

  validate() {
    let isValid = true;
    let [validation, feedback] = ['success', ''];
    try {
      this.props.validate();
    } catch (e) {
      isValid = false;
      validation = 'error';
      feedback = e.message;
    }
    this.setState({ validation, feedback });
    return isValid;
  }

  render() {
    return (
      <FormGroup validationState={this.state.validation} {...this.props}>
        <ControlLabel>
          {this.props.label} {this.props.required ? <sup>&#x2731;</sup> : ''}
        </ControlLabel>
        <div className="form-control-wrap">
          {this.props.children}
        </div>
        <div className="form-control-feedback">
          {this.state.feedback}
        </div>
      </FormGroup>
    );
  }
}

ValidationField.defaultProps = {
  validate: () => true,
  required: false,
};

ValidationField.propTypes = {
  validate: PropTypes.func,
  controlId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

ValidationField.contextTypes = {
  fields: PropTypes.any,
  addField: PropTypes.func.isRequired,
  removeField: PropTypes.func.isRequired,
  validate: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};
