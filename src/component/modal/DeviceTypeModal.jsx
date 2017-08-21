import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import BaseDataEditableModal from './BaseDataEditableModal';
import Api from '../../common/api';
import ValidationField from '../form/ValidationField';
import ValidationForm, { ValidationError } from '../form/ValidationForm';

export default class DeviceTypeModal extends BaseDataEditableModal {
  constructor(props) {
    super(
      props,
      { label: '', value: '' },
      {
        add: { title: '새로운 디바이스 타입 등록' },
        modify: { title: '디바이스 타입 수정' },
      },
    );
  }

  getData() {
    return {
      label: this.state.data.label,
      value: this.state.data.value,
    };
  }

  resolveData(data) {
    return Object.assign({}, data);
  }

  doAdd(data) {
    return Api.addDeviceType(data);
  }

  doModify(id, data) {
    return Api.updateDeviceType(id, data);
  }

  doValidate() {
    return this.form.validate();
  }

  validateField(id) {
    const data = this.state.data;
    switch (id) {
      case 'label':
        if (!data.label) {
          throw new ValidationError('디바이스 타입의 라벨을 설정해 주세요.');
        }
        break;
      case 'value':
        if (!data.value) {
          throw new ValidationError('디바이스 타입의 값을 설정해 주세요.');
        }
        break;
      default:
        break;
    }
  }

  renderChild() {
    return (
      <ValidationForm ref={(form) => { this.form = form; }}>
        <ValidationField
          controlId="label"
          required
          label="디바이스 타입 라벨"
          validate={() => this.validateField('label')}
        >
          <FormControl
            componentClass="input"
            value={this.state.data.label}
            onChange={e => this.setDataField({ label: e.target.value })}
            placeholder="라벨"
          />
        </ValidationField>

        <ValidationField
          controlId="value"
          label="디바이스 타입 값"
          required
          validate={() => this.validateField('value')}
        >
          <FormControl
            componentClass="input"
            value={this.state.data.value}
            onChange={e => this.setDataField({ value: e.target.value })}
            placeholder="값"
            readOnly={this.props.mode === 'modify'}
          />
        </ValidationField>
      </ValidationForm>
    );
  }
}

DeviceTypeModal.defaultProps = {
  onSuccess: () => {},
};

DeviceTypeModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'modify']).isRequired,
  data: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    template: PropTypes.string,
  }).isRequired,
};
