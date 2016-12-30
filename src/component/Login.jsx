const React = require('react');
const Form = require('react-bootstrap/lib/Form');
const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const Button = require('react-bootstrap/lib/Button');
const Col = require('react-bootstrap/lib/Col');
const Alert = require('react-bootstrap/lib/Alert');

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  render() {
    return (
      <Col xxs={10} xxsOffset={1} xs={6} xsOffset={3} md={4} mdOffset={4}>
        <Alert style={{ display: this.props.errorMessage ? 'block' : 'none' }} bsStyle="warning">{this.props.errorMessage}</Alert>
        <Form method="post" action="/login">
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
