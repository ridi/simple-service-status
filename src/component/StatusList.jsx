const React = require('react');
const Table = require('./Table');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
const Button = require('react-bootstrap/lib/Button');

const CreateModal = require('./CreateModal');

const moment = require('moment');
const dateFormat = 'YYYY-MM-DD HH:mm';

class StatusList extends React.Component {
  constructor(props) {
    super(props);

    const self = this;
    this.columns = [
      {
        title: 'deviceType',
        display: row => row.deviceType ? row.deviceType.join(', ') : '',
      },
      { title: 'deviceVersion', key: 'deviceVersion' },
      { title: 'appVersion', key: 'appVersion' },
      {
        title: '기간',
        display: (row) => {
          const start = moment(row.startTime);
          const end = moment(row.endTime);
          const duration = start.from(end, true);
          return <span>{`${start.format(dateFormat)} ~ ${end.format(dateFormat)} (${duration})`}</span>;
        },
      },
      {
        title: '타입',
        display: (row) => {
          if (!row.type) {
            return '';
          }
          let typeLabel = 'Unkown';
          for (let i = 0; i < self.props.statusTypes.length; i++) {
            if (row.type === self.props.statusTypes[i].value) {
              typeLabel = self.props.statusTypes[i].label;
              break;
            }
          }
          return <span>{typeLabel}</span>;
        },
      },
      {
        title: 'contents',
        isChildRow: true,
        display: (row) => {
          if (!row.contents) {
            return '';
          }
          return <span>{row.contents.split(/(\r\n|\n|\r)/gm).map(line => <p>{line}</p>).join('')}</span>;
        },
      },
      {
        title: 'isActivated',
        key: 'isActivated',
      },
    ];
  }

  render() {
    return (
      <div>
        <ButtonToolbar>
          <Button onClick={e => this.modal.show(e)}>Add</Button>
        </ButtonToolbar>
        <Table items={this.props.items} columns={this.columns} />
        <CreateModal ref={(modal) => { this.modal = modal; }} statusTypes={this.props.statusTypes} />
      </div>
    );
  }
}
StatusList.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

module.exports = StatusList;

