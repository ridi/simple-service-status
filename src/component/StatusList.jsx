const React = require('react');
const Table = require('./Table');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
const Button = require('react-bootstrap/lib/Button');
const Label = require('react-bootstrap/lib/Label');

const CreateModal = require('./CreateModal');

const moment = require('moment');
const axios = require('axios');

const dateFormat = 'YYYY-MM-DD HH:mm';

class StatusList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.items,
      buttonDisabled: {
        add: false,
        modify: true,
        remove: true,
        clone: true,
        activate: true,
      },
      targetItem: {},
      checkedItems: [],
    };

    const self = this;
    this.columns = [
      {
        title: '디바이스 타입',
        display: row => row.deviceType ? <span>{row.deviceType.join(', ')}</span> : '',
      },
      {
        title: '디바이스 버전',
        display: row => <span>{`${row.deviceVersion[0]} ${row.deviceVersion.length > 1 ? row.deviceVersion.slice(1).join('.') : ''}`}</span>,
      },
      {
        title: '앱 버전',
        display: row => <span>{`${row.appVersion[0]} ${row.appVersion.length > 1 ? row.appVersion.slice(1).join('.') : ''}`}</span>,
      },
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
          let typeLabel = 'Unknown';
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
        title: '내용',
        isChildRow: true,
        display: (row) => {
          if (!row.contents) {
            return '';
          }
          return <span>{row.contents.split(/(\r\n|\n|\r)/gm).map(line => <p>{line}</p>)}</span>;
        },
      },
      {
        title: '활성화',
        display: row => <Label bsStyle={row.isActivated ? 'success' : 'default'}>{row.isActivated ? 'ON' : 'OFF'}</Label>,
      },
    ];
  }

  refresh() {
    axios.get('/api/v1/status')
      .then(response => this.setState({ items: response.data, error: null }))
      .catch(error => this.setState({ error }));
  }

  onChechboxChanged(checkedItems) {
    if (checkedItems.length === 1) {
      this.setState({ buttonDisabled: { add: false, modify: false, remove: false, clone: false, activate: false } });
    } else if (checkedItems.length > 1) {
      this.setState({ buttonDisabled: { add: false, modify: true, remove: false, clone: true, activate: false } });
    } else {
      this.setState({ buttonDisabled: { add: false, modify: true, remove: true, clone: true, activate: true } });
    }
    this.setState({ checkedItems });
  }

  showModal(mode, data) {
    this.modal.show(mode, data);
  }

  activate() {
    // TODO
  }

  remove() {
    // TODO
  }

  render() {
    const modal = (
      <CreateModal
        ref={(m) => { this.modal = m; }}
        statusTypes={this.props.statusTypes}
        onSuccess={() => this.refresh()}
      />
    );
    return (
      <div>
        <ButtonToolbar pullRight>
          <Button onClick={() => this.showModal('add')} bsSize="small" disabled={this.state.buttonDisabled.add}>등록</Button>
          <Button onClick={() => this.showModal('modify', this.state.checkedItems[0])} bsSize="small" disabled={this.state.buttonDisabled.modify}>수정</Button>
          <Button onClick={() => this.showModal('add', this.state.checkedItems[0])} bsSize="small" disabled={this.state.buttonDisabled.clone}>복제</Button>
          <Button onClick={() => this.activate()} bsSize="small" disabled={this.state.buttonDisabled.activate}>활성화</Button>
          <Button onClick={() => this.remove()} bsSize="small" bsStyle="danger" disabled={this.state.buttonDisabled.remove}>삭제</Button>
        </ButtonToolbar>
        <Table items={this.state.items} columns={this.columns} error={this.state.error} onCheckboxChange={(checkedItems => this.onChechboxChanged(checkedItems))} />
        {modal}
      </div>
    );
  }
}
StatusList.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

module.exports = StatusList;

