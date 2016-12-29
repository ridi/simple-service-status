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
      <Col xs={10} md={6} xsOffset={1} mdOffset={3}>
        <Alert style={{ display: this.props.errorMessage ? 'block' : 'none' }} bsStyle="warning">{this.props.errorMessage}</Alert>
        <Form method="post" action="/login">
          <FormGroup controlId="username">
            <ControlLabel>Username</ControlLabel>
            <FormControl type="text" name="username" value={this.state.username} onChange={e => this.setState({ username: e.target.value })} placeholder="Username" />
          </FormGroup>
          <FormGroup controlId="password">
            <ControlLabel>Password</ControlLabel>
            <FormControl type="password" name="password" value={this.state.password} onChange={e => this.setState({ password: e.target.value })} placeholder="Password" />
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
