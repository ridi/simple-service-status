import React from 'react';
import PropTypes from 'prop-types';

function FormContext () {
  this.fields = [];

  this.reset = () => {
    this.fields = [];
  };

  this.addField = (field) => {
    if (field) {
      this.fields.push(field);
    }
  };

  this.removeField = (field) => {
    if (field && this.fields.indexOf(field) > -1) {
      this.fields.splice(this.fields.indexOf(field), 1);
    }
  };

  this.validate = () => {
    let isValid = true;
    this.fields.forEach((field) => {
      isValid = field.validate() && isValid;
    });
    return isValid;
  };
}

export default class ValidationForm extends React.Component {
  constructor(props) {
    super(props);
    this.formContext = new FormContext();
  }

  getChildContext() {
    return this.formContext;
  }

  componentWillMount() {
    this.formContext.reset();
  }

  componentDidMount() {
    this.validate();
  }

  validate() {
    return this.formContext.validate();
  }

  render() {
    return (
      <form>
        {this.props.children}
      </form>
    );
  }
}

ValidationForm.childContextTypes = {
  fields: PropTypes.any,
  addField: PropTypes.func.isRequired,
  removeField: PropTypes.func.isRequired,
  validate: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};

export class ValidationError extends Error {
  constructor(message = 'Invalid data input', level = 'error') {
    super(message);
    this.level = level;
    this.name = 'ValidationError';
  }
}

