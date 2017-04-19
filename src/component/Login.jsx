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

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  onSubmit(e) {
    e.preventDefault();
    Api.login({ username: this.state.username, password: this.state.password })
      .then(() => {
        const search = /redirect=(.*)[&]?/.exec(window.location.search);
        this.setState({ errorMessage: null });
        window.location.href = search ? search[1] : '/';
      })
      .catch((err) => {
        this.setState({ errorMessage: (err && err.response && err.response.data) ? err.response.data.message : null });
      });
  }

  render() {
    return (
      <Col xs={6} xsOffset={3} md={4} mdOffset={4}>
        <Alert style={{ display: this.state.errorMessage ? 'block' : 'none' }} bsStyle="danger">{this.state.errorMessage}</Alert>
        <Alert bsStyle="info">로그인이 필요한 서비스입니다.</Alert>
        <Form onSubmit={e => this.onSubmit(e)}>
          <FormGroup controlId="username">
            <ControlLabel>사용자 이름</ControlLabel>
            <FormControl
              type="text"
              name="username"
              value={this.state.username}
              onChange={e => this.setState({ username: e.target.value })} placeholder="사용자 이름을 입력하세요"
            />
          </FormGroup>
          <FormGroup controlId="password">
            <ControlLabel>패스워드</ControlLabel>
            <FormControl
              type="password"
              name="password"
              value={this.state.password}
              onChange={e => this.setState({ password: e.target.value })} placeholder="패스워드를 입력하세요"
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

Login.defaultProps = {
  errorMessage: '',
};

Login.propTypes = {
  errorMessage: PropTypes.string,
};
