const React = require('react');
const Form = require('react-bootstrap/lib/Form');
const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const HelpBlock = require('react-bootstrap/lib/HelpBlock');
const Button = require('react-bootstrap/lib/Button');
const Col = require('react-bootstrap/lib/Col');

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
      <div>
        <div>{this.props.errorMessage}</div>
        <Form horizontal method="post" action="/login">
          <FormGroup controlId="username">
            <Col componentClass={ControlLabel} sm={2}>Username</Col>
            <Col sm={10}>
              <FormControl type="text" name="username" value={this.state.username} placeholder="Username" />
            </Col>
          </FormGroup>
          <FormGroup controlId="password">
            <Col componentClass={ControlLabel} sm={2}>Password</Col>
            <Col sm={10}>
              <FormControl type="password" name="password" value={this.state.password} placeholder="Password" />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Button type="submit">Submit</Button>
            </Col>
          </FormGroup>
        </Form>
      </div>
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
