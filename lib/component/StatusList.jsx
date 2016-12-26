const React = require('react');
const Table = require('./Table');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
const Button = require('react-bootstrap/lib/Button');

const CreateModal = require('./CreateModal');

class StatusList extends React.Component {

  render() {
    return (
      <div>
        <ButtonToolbar>
          <Button onClick={e => this.modal.show(e)}>Add</Button>
        </ButtonToolbar>
        <Table items={this.props.items} columns={this.props.columns} />
        <CreateModal ref={(modal) => { this.modal = modal; }} />
      </div>
    );
  }
}
StatusList.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

module.exports = StatusList;

