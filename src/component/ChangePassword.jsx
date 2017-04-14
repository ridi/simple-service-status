/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Col,
  Alert,
} from 'react-bootstrap';

import Api from '../common/api';

export default class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      password2: '',
    };
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.state.password !== this.state.password2) {
      this.setState({ errorMessage: '비밀번호가 서로 다릅니다. 다시 입력해 주세요.' });
    } else {
      Api.changePassword({ password: this.state.password })
        .then(() => {
          const search = /redirect=(.*)[&]?/.exec(window.location.search);
          this.setState({ errorMessage: null });
          window.location.href = search ? search[1] : '/';
        })
        .catch((err) => {
          this.setState({ errorMessage: (err && err.response && err.response.data) ? err.response.data.message : null });
        });
    }
  }

  render() {
    return (
      <Col xs={6} xsOffset={3} md={4} mdOffset={4}>
        <Alert style={{ display: this.state.errorMessage ? 'block' : 'none' }} bsStyle="danger">{this.state.errorMessage}</Alert>
        <Alert bsStyle="info">임시 비밀번호를 사용하고 있는 계정입니다. 계속 하시려면 새로운 비밀번호를 입력하셔야 합니다.</Alert>
        <Form onSubmit={e => this.onSubmit(e)}>
          <FormGroup controlId="password">
            <ControlLabel>새로운 패스워드</ControlLabel>
            <FormControl
              type="password"
              name="password"
              value={this.state.password}
              onChange={e => this.setState({ password: e.target.value })} placeholder="패스워드를 입력하세요"
            />
          </FormGroup>
          <FormGroup controlId="password2">
            <ControlLabel>새로운 패스워드 확인</ControlLabel>
            <FormControl
              type="password"
              name="password2"
              value={this.state.password2}
              onChange={e => this.setState({ password2: e.target.value })} placeholder="동일한 패스워드를 입력하세요"
            />
          </FormGroup>
          <FormGroup>
            <Button type="submit">Submit</Button>
          </FormGroup>
        </Form>
      </Col>
    );
  }
}

ChangePassword.defaultProps = {
  errorMessage: '',
};

ChangePassword.propTypes = {
  errorMessage: PropTypes.string,
};
