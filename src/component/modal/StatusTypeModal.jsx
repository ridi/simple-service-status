import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Row,
} from 'react-bootstrap';
import DataEditableModal from './DataEditableModal';
import RichEditor from '../form/RichEditor';
import Api from '../../common/api';
import ValidationField from '../form/ValidationField';
import ValidationForm, { ValidationError } from '../form/ValidationForm';

export default class StatusTypeModal extends DataEditableModal {
  constructor(props) {
    super(
      props,
      { label: '', value: '', template: '' },
      {
        add: { title: '새로운 알림 타입 등록' },
        modify: { title: '알림 타입 수정' },
      },
    );
  }

  getData() {
    return {
      label: this.state.data.label,
      value: this.state.data.value,
      template: this.state.data.template,
    };
  }

  resolveData(data) {
    return Object.assign({}, data);
  }

  doAdd(data) {
    return Api.addStatusType(data);
  }

  doModify(id, data) {
    return Api.updateStatusType(id, data);
  }

  doValidate() {
    return this.form.validate();
  }

  validateField(id) {
    const data = this.state.data;
    switch (id) {
      case 'label':
        if (!data.label) {
          throw new ValidationError('상태 타입의 라벨을 설정해 주세요.');
        }
        break;
      case 'value':
        if (!data.value) {
          throw new ValidationError('상태 타입의 값을 설정해 주세요.');
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
          label="상태 타입 라벨"
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
          label="상태 타입 값"
          required
          validate={() => this.validateField('value')}
        >
          <FormControl
            componentClass="input"
            value={this.state.data.value}
            onChange={e => this.setDataField({ value: e.target.value })}
            placeholder="값"
          />
        </ValidationField>

        <FormGroup controlId="template">
          <ControlLabel>상태 타입 템플릿</ControlLabel>
          <RichEditor
            value={this.state.data.template}
            onChange={template => this.setDataField({ template })}
            placeholder="템플릿"
          />
        </FormGroup>
        <Row>
          <HelpBlock>설정한 템플릿 내용은 새로운 알림을 생성할 때 알림 내용의 기본값으로 사용됩니다.</HelpBlock>
        </Row>
      </ValidationForm>
    );
  }
}

StatusTypeModal.defaultProps = {
  onSuccess: () => {},
};

StatusTypeModal.propTypes = {
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
