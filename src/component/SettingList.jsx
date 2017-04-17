const React = require('react');
const PropTypes = require('prop-types');

const Table = require('./Table');
const Loading = require('./Loading');
const StatusTypeCreateModal = require('./StatusTypeCreateModal');
const Modal = require('./Modal');

const Tabs = require('react-bootstrap/lib/Tabs');
const Tab = require('react-bootstrap/lib/Tab');
const Row = require('react-bootstrap/lib/Row');
const Col = require('react-bootstrap/lib/Col');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
const Button = require('react-bootstrap/lib/Button');

const Api = require('../common/api');

// TODO TableTab 컴포넌트 만들어서 공통화 하기

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'statusType',
      showLoading: false,
      statusType: {
        items: [],
        buttonDisabled: {
          add: false,
          modify: true,
          remove: true,
        },
        checkedItems: [],
      },
      deviceType: {
        items: [],
        buttonDisabled: {
          add: true,
          modify: true,
          remove: true,
        },
        checkedItems: [],
      },
    };
    this.tables = {};
    this.statusTypeColumns = [
      { title: '라벨', key: 'label' },
      { title: '값', key: 'value' },
      {
        title: '템플릿',
        isChildRow: true,
        display: (row) => {
          if (!row.template) {
            return '';
          }
          return <span dangerouslySetInnerHTML={{ __html: row.template }} />;
        },
      },
    ];
    this.deviceTypeColumns = [
      { title: '라벨', key: 'label' },
      { title: '값', key: 'value' },
    ];
    this.modals = {};
  }

  componentDidMount() {
    this.refresh(this.state.activeTab);
  }

  onCheckboxChanged(tabName, checkedItems) {
    const newState = {};
    newState[tabName] = {};
    Object.assign(newState[tabName], this.state[tabName]);
    if (checkedItems.length === 1) {
      newState[tabName].buttonDisabled = { add: false, modify: false, remove: false };
    } else if (checkedItems.length > 1) {
      newState[tabName].buttonDisabled = { add: false, modify: true, remove: false };
    } else {
      newState[tabName].buttonDisabled = { add: false, modify: true, remove: true };
    }
    newState[tabName].checkedItems = checkedItems;
    this.setState(newState);
  }

  onTabChanged(activeTab) {
    this.setState({ activeTab }, () => this.refresh(activeTab));
  }

  showModal(mode, data) {
    this.modals.createModal.show(mode, data);
  }

  refresh(tabName) {
    this.setState({ showLoading: true });
    const table = this.tables[tabName];
    const newState = {};
    newState[tabName] = {};
    Object.assign(newState[tabName], this.state[tabName]);

    const api = (tabName === 'statusType') ? Api.getStatusTypes() : Api.getDeviceTypes();
    return api.then((response) => {
        newState[tabName].items = response.data.data;
        newState[tabName].totalCount = response.data.totalCount;
        newState[tabName].error = null;
        newState[tabName].checkedItems = [];
        this.setState(newState);
        table.setChecked(false);
        this.setState({ showLoading: false });
      })
      .catch((error) => {
        newState[tabName].items = [];
        newState[tabName].totalCount = 0;
        newState[tabName].error = error;
        newState[tabName].checkedItems = [];
        this.setState(newState);
        table.setChecked(false);
        this.setState({ showLoading: false });
      });
  }

  startToRemove() {
    this.modals.removeModal.show();
  }

  remove(tabName, items) {
    if (items instanceof Array && items.length > 0) {
      Promise.all(items.map(item => Api.removeStatusType(item.id)))
        .then(() => {
          this.refresh(tabName);
          this.modals.removeModal.close();
        })
        .catch(error => this.setState({ error }));
    }
  }

  render() {
    const statusTypeState = this.state.statusType;
    const deviceTypeState = this.state.deviceType;
    return (
      <div>
        <Tabs id="tabsForSettings" activeKey={this.state.activeTab} onSelect={activeTab => this.onTabChanged(activeTab)}>
          <Tab eventKey={'statusType'} title="상태 타입 목록">
            <ButtonToolbar>
              <Button
                onClick={() => this.showModal('add')}
                bsSize="small"
                disabled={statusTypeState.buttonDisabled.add}
              >
                등록
              </Button>
              <Button
                onClick={() => this.showModal('modify', statusTypeState.checkedItems[0])}
                bsSize="small"
                disabled={statusTypeState.buttonDisabled.modify}
              >
                수정
              </Button>
              <Button onClick={() => this.startToRemove()} bsSize="small" disabled={statusTypeState.buttonDisabled.remove}>
                삭제
              </Button>
            </ButtonToolbar>
            <Row className="table-info">
              <Col xs={6} className="table-info-left">총 {statusTypeState.items.length}건의 데이터</Col>
              <Col xs={6} className="table-info-right" />
            </Row>
            <Table
              ref={(t) => { this.tables.statusType = t; }}
              items={statusTypeState.items}
              columns={this.statusTypeColumns}
              onCheckboxChange={(checkedItems => this.onCheckboxChanged('statusType', checkedItems))}
              showCheckbox
            />
          </Tab>
          <Tab eventKey={'deviceType'} title="디바이스 타입 목록">
            <Row className="table-info">
              <Col xs={6} className="table-info-left">총 {deviceTypeState.items.length}건의 데이터</Col>
              <Col xs={6} className="table-info-right" />
            </Row>
            <Table
              ref={(t) => { this.tables.deviceType = t; }}
              items={deviceTypeState.items}
              columns={this.deviceTypeColumns}
            />
          </Tab>
        </Tabs>
        <StatusTypeCreateModal
          ref={(m) => { this.modals.createModal = m; }}
          onSuccess={() => this.refresh(this.state.activeTab)}
        />
        <Modal
          ref={(m) => { this.modals.removeModal = m; }}
          mode={'confirm'}
          title="삭제 확인"
          onConfirm={() => this.remove(this.state.activeTab, this.state[this.state.activeTab].checkedItems)}
        >
          <p>{this.state[this.state.activeTab].checkedItems.length} 건의 데이터를 삭제하시겠습니까?</p>
        </Modal>
        <Loading show={this.state.showLoading} />
      </div>
    );
  }
}

Settings.defaultProps = {
  statusTypes: [],
  deviceTypes: [],
};

Settings.propTypes = {
  statusTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  deviceTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
};

module.exports = Settings;
