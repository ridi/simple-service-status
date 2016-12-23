const React = require('react');
const Table = require('./Table');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
const Button = require('react-bootstrap/lib/Button');

const Modal = require('react-bootstrap/lib/Modal');
const Form = require('react-bootstrap/lib/Form');
const FormGroup = require('react-bootstrap/lib/FormGroup');
const ControlLabel = require('react-bootstrap/lib/ControlLabel');
const FormControl = require('react-bootstrap/lib/FormControl');
const HelpBlock = require('react-bootstrap/lib/HelpBlock');

class StatusList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
    };
  }

  show() {
    this.setState({ showModal: true });
  }

  onClose() {

  }

  modal() {
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup controlId="username">
            <ControlLabel>Username</ControlLabel>
            <FormControl type="text" name="username" value={this.state.username} placeholder="Username" />
          </FormGroup>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    );
  }
  render() {
    return (
      <div>
        <ButtonToolbar>
          <Button onClick={e => this.show(e)}>Add</Button>
        </ButtonToolbar>
        <Table items={this.props.items} columns={this.props.columns} />
        <Modal show={this.state.showModal} onHide={this.onClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="username">
              <ControlLabel>Username</ControlLabel>
              <FormControl type="text" name="username" value={this.state.username} placeholder="Username" />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer />
        </Modal>
      </div>
    );
  }
}
StatusList.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

module.exports = StatusList;

