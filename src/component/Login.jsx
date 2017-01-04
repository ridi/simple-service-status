const React = require('react');
const Form = require('react-bootstrap/lib/Form');
const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const Button = require('react-bootstrap/lib/Button');
const Col = require('react-bootstrap/lib/Col');
const Alert = require('react-bootstrap/lib/Alert');

const axios = require('axios');

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  onSubmit(e) {
    e.preventDefault();
    axios.post('/api/v1/login', this.state)
      .then((response) => {
        const search = /redirect=(.*)[\&]?/.exec(window.location.search);
        this.setState({ errorMessage: null });
        window.location.href = search ? search[1] : '/';
      })
      .catch((e) => {
        this.setState({ errorMessage: (e && e.response && e.response.data) ? e.response.data.message : null });
      });
  }

  render() {
    return (
      <Col xs={6} xsOffset={3} md={4} mdOffset={4}>
        <Alert style={{ display: this.state.errorMessage ? 'block' : 'none' }} bsStyle="warning">{this.state.errorMessage}</Alert>
        <Form onSubmit={(e) => this.onSubmit(e)}>
          <FormGroup controlId="username">
            <ControlLabel>사용자 이름</ControlLabel>
            <FormControl type="text" name="username" value={this.state.username} onChange={e => this.setState({ username: e.target.value })} placeholder="사용자 이름을 입력하세요" />
          </FormGroup>
          <FormGroup controlId="password">
            <ControlLabel>패스워드</ControlLabel>
            <FormControl type="password" name="password" value={this.state.password} onChange={e => this.setState({ password: e.target.value })} placeholder="패스워드를 입력하세요" />
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
  errorMessage: React.PropTypes.string,
};


module.exports = Login;
