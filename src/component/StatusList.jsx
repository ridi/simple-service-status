import React from 'react';
import PropTypes from 'prop-types';
import {
  ButtonToolbar,
  ButtonGroup,
  Button,
  Label,
  Row,
  Col,
  Pagination,
  Tabs,
  Tab,
} from 'react-bootstrap';
import moment from 'moment';
import Table from './Table';

import CreateModal from './CreateModal';
import Modal from './Modal';
import Loading from './Loading';

import dateUtil from '../common/date-util';
import Api from '../common/api';

const dateFormat = 'YYYY-MM-DD HH:mm';

const options = {
  statusTypes: [],
  deviceTypes: [],
};

const defaultTabState = Object.freeze({
  items: [],
  buttonDisabled: {
    add: false,
    modify: true,
    remove: true,
    clone: true,
    activate: true,
  },
  checkedItems: [],
  page: 1,
  totalCount: 0,
  countPerPage: 10,
});

const ASTERISK = '✱';

export default class StatusList extends React.Component {
  constructor(props) {
    super(props);
    const self = this;
    options.statusTypes = props.statusTypes;
    options.deviceTypes = props.deviceTypes;

    this.state = {
      current: Object.assign({}, defaultTabState),
      expired: Object.assign({}, defaultTabState),
      activationMode: true,
      activeTab: 'current',
      showLoading: false,
      statusModal: {
        visible: false,
        mode: 'add',
        data: null,
      },
      removeModal: {
        visible: false,
      },
      activationModal: {
        visible: false,
      },
    };

    this.modals = {};
    this.tables = {};

    this.expiredTableColumns = [
      {
        title: '상태 타입',
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
        title: '제목',
        display: row => <span>{row.title}</span>,
      },
      {
        title: '기간',
        display: (row) => {
          if (!row.startTime || !row.endTime) {
            return <span>{ASTERISK}</span>;
          }
          const start = moment(row.startTime);
          const end = moment(row.endTime);
          const duration = start.from(end, true);
          return <span>{`${dateUtil.formatDate(start, dateFormat)} ~ ${dateUtil.formatDate(end, dateFormat)} (${duration})`}</span>;
        },
      },
      {
        title: '디바이스 타입',
        display: (row) => {
          if (!row.deviceTypes) {
            return <span />;
          }
          if (row.deviceTypes.length === options.deviceTypes.length) {
            return <span>{ASTERISK}</span>;
          }
          return row.deviceTypes ? <span>{row.deviceTypes.join(', ')}</span> : <span />;
        },
      },
      {
        title: '디바이스 버전',
        display: (row) => {
          if (row.deviceSemVersion === '*') {
            return <span>{ASTERISK}</span>;
          }
          return row.deviceSemVersion;
        },
      },
      {
        title: '앱 버전',
        display: (row) => {
          if (row.appSemVersion === '*') {
            return <span>{ASTERISK}</span>;
          }
          return row.appSemVersion;
        },
      },
      {
        title: '내용',
        isChildRow: true,
        display: (row) => {
          if (!row.contents) {
            return '';
          }
          return <span dangerouslySetInnerHTML={{ __html: row.contents }} />;
        },
      },
    ];

    this.currentTableColumns = this.expiredTableColumns.concat({
      title: '활성화',
      display: row => <Label bsStyle={row.isActivated ? 'success' : 'default'}>{row.isActivated ? 'ON' : 'OFF'}</Label>,
    });
  }

  componentDidMount() {
    this.refresh(this.state.activeTab);
  }

  onCheckboxChanged(tabName, checkedItems) {
    const newState = {};
    newState[tabName] = {};
    Object.assign(newState[tabName], this.state[tabName]);
    if (checkedItems.length === 1) {
      newState[tabName].buttonDisabled = { add: false, modify: false, remove: false, clone: false, activate: false };
    } else if (checkedItems.length > 1) {
      newState[tabName].buttonDisabled = { add: false, modify: true, remove: false, clone: true, activate: false };
    } else {
      newState[tabName].buttonDisabled = { add: false, modify: true, remove: true, clone: true, activate: true };
    }
    newState[tabName].checkedItems = checkedItems;
    this.setState(newState);
  }

  showStatusModal(mode = 'add', data = null) {
    this.setState({ statusModal: { visible: true, mode, data } });
  }

  closeStatusModal() {
    this.setState({ statusModal: { visible: false, mode: this.state.statusModal.mode, data: null } });
  }

  startToSetActivation(activationMode) {
    this.setState({ activationMode, activationModal: { visible: true } });
  }

  closeActivationModal() {
    this.setState({ activationModal: { visible: false } });
  }

  setActivation(tabName, isActivated, items) {
    if (items instanceof Array && items.length > 0) {
      const api = isActivated ? Api.activateStatus : Api.deactivateStatus;
      Promise.all(items.map(item => api(item.id)))
        .then(() => {
          this.refresh(tabName);
          this.closeActivationModal();
        })
        .catch(error => this.setState({ error }));
    }
  }

  refresh(tabName) {
    this.setState({ showLoading: true });
    const table = this.tables[tabName];
    const newState = {};
    newState[tabName] = {};
    Object.assign(newState[tabName], this.state[tabName]);

    const skip = (this.state[tabName].page - 1) * this.state[tabName].countPerPage;
    const limit = this.state[tabName].countPerPage;

    return Api.getStatus(tabName, skip, limit)
      .then((response) => {
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
    this.setState({ removeModal: { visible: true }});
  }

  closeRemoveModal() {
    this.setState({ removeModal: { visible: false } });
  }

  remove(tabName, items) {
    if (items instanceof Array && items.length > 0) {
      Promise.all(items.map(item => Api.removeStatus(item.id)))
        .then(() => {
          this.refresh(tabName);
          this.closeRemoveModal();
        })
        .catch(error => this.setState({ error }));
    }
  }

  onTabChanged(activeTab) {
    this.setState({ activeTab }, () => this.refresh(activeTab));
  }

  onPageChanged(tabName, page) {
    const newState = {};
    newState[tabName] = {};
    Object.assign(newState[tabName], this.state[tabName]);
    newState[tabName].page = page;
    this.setState(newState, () => this.refresh(this.state.activeTab));
  }

  render() {
    const currentState = this.state.current;
    const expireState = this.state.expired;
    return (
      <div>
        <Tabs id="tabsForStatus" activeKey={this.state.activeTab} onSelect={activeTab => this.onTabChanged(activeTab)}>
          <Tab eventKey={'current'} title="현재 공지사항 목록">
            <ButtonToolbar>
              <ButtonGroup>
                <Button
                  onClick={() => this.showStatusModal('add')}
                  bsSize="small"
                  disabled={currentState.buttonDisabled.add}
                >
                  등록
                </Button>
                <Button
                  onClick={() => this.showStatusModal('add', currentState.checkedItems[0])}
                  bsSize="small"
                  disabled={currentState.buttonDisabled.clone}
                >
                  복제
                </Button>
              </ButtonGroup>
              <Button
                onClick={() => this.showStatusModal('modify', currentState.checkedItems[0])}
                bsSize="small"
                disabled={currentState.buttonDisabled.modify}
              >
                수정
              </Button>
              <ButtonGroup>
                <Button
                  onClick={() => this.startToSetActivation(true)}
                  bsSize="small"
                  disabled={currentState.buttonDisabled.activate}
                >
                  활성화
                </Button>
                <Button
                  onClick={() => this.startToSetActivation(false)}
                  bsSize="small"
                  disabled={currentState.buttonDisabled.activate}
                >
                  비활성화
                </Button>
              </ButtonGroup>
              <Button onClick={() => this.startToRemove()} bsSize="small" disabled={currentState.buttonDisabled.remove}>
                삭제
              </Button>
            </ButtonToolbar>

            <Row className="table-info">
              <Col xs={6} className="table-info-left">총 {currentState.totalCount || 0}건의 데이터</Col>
              <Col xs={6} className="table-info-right">
                {currentState.page} / {Math.ceil(currentState.totalCount / currentState.countPerPage) || 1} 페이지
              </Col>
            </Row>
            <Table
              ref={(t) => { this.tables.current = t; }}
              items={currentState.items}
              columns={this.currentTableColumns}
              error={currentState.error}
              onCheckboxChange={(checkedItems => this.onCheckboxChanged('current', checkedItems))}
              onPageChange={page => this.onPageChanged('current', page)}
              page={currentState.page}
              totalPage={Math.ceil(currentState.totalCount / currentState.countPerPage) || 1}
              showCheckbox
            />
            <div className="text-center">
              <Pagination
                prev next first last
                items={Math.ceil(currentState.totalCount / currentState.countPerPage) || 1}
                activePage={currentState.page || 1}
                onSelect={page => this.onPageChanged('current', page)}
              />
            </div>
          </Tab>

          <Tab eventKey={'expired'} title="만료된 공지사항 목록">
            <ButtonToolbar>
              <ButtonGroup>
                <Button
                  onClick={() => this.showStatusModal('add')}
                  bsSize="small"
                  disabled={expireState.buttonDisabled.add}
                >
                  등록
                </Button>
                <Button
                  onClick={() => this.showStatusModal('add', expireState.checkedItems[0])}
                  bsSize="small"
                  disabled={expireState.buttonDisabled.clone}
                >
                  복제
                </Button>
              </ButtonGroup>
              <Button
                onClick={() => this.showStatusModal('modify', expireState.checkedItems[0])}
                bsSize="small"
                disabled={expireState.buttonDisabled.modify}
              >
                수정
              </Button>
              <Button onClick={() => this.startToRemove()} bsSize="small" disabled={expireState.buttonDisabled.remove}>
                삭제
              </Button>
            </ButtonToolbar>

            <Row className="table-info">
              <Col xs={6} className="table-info-left">총 {expireState.totalCount || 0}건의 데이터</Col>
              <Col xs={6} className="table-info-right">
                {expireState.page} / {Math.ceil(expireState.totalCount / expireState.countPerPage) || 1} 페이지
              </Col>
            </Row>
            <Table
              ref={(t) => { this.tables.expired = t; }}
              items={expireState.items}
              columns={this.expiredTableColumns}
              error={expireState.error}
              onCheckboxChange={checkedItems => this.onCheckboxChanged('expired', checkedItems)}
              showCheckbox
            />
            <div className="text-center">
              <Pagination
                prev next first last
                items={Math.ceil(expireState.totalCount / expireState.countPerPage) || 1}
                activePage={expireState.page || 1}
                onSelect={page => this.onPageChanged('expired', page)}
              />
            </div>
          </Tab>
        </Tabs>
        <CreateModal
          visible={this.state.statusModal.visible}
          options={options}
          onSuccess={() => this.refresh(this.state.activeTab)}
          onClose={() => this.closeStatusModal()}
          mode={this.state.statusModal.mode}
          data={this.state.statusModal.data}
        />
        <Modal
          visible={this.state.removeModal.visible}
          mode={'confirm'}
          title="삭제 확인"
          onConfirm={() => this.remove(this.state.activeTab, this.state[this.state.activeTab].checkedItems)}
          onClose={() => this.closeRemoveModal()}
        >
          <p>{this.state[this.state.activeTab].checkedItems.length} 건의 데이터를 삭제하시겠습니까?</p>
        </Modal>
        <Modal
          visible={this.state.activationModal.visible}
          mode={'confirm'}
          title={this.state.activationMode ? '활성화 확인' : '비활성화 확인'}
          onConfirm={() => this.setActivation(this.state.activeTab, this.state.activationMode,
            this.state[this.state.activeTab].checkedItems)}
          onClose={() => this.closeActivationModal()}
        >
          <p>
            {this.state[this.state.activeTab].checkedItems.length} 건의 데이터를
            {this.state.activationMode ? '활성화' : '비활성화'} 하시겠습니까?
          </p>
        </Modal>
        <Loading show={this.state.showLoading} />
      </div>
    );
  }
}
StatusList.propTypes = {
  statusTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  deviceTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
};
