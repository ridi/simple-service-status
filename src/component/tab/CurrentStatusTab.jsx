import React from 'react';
import PropTypes from 'prop-types';
import {
  ButtonToolbar,
  ButtonGroup,
  Button,
  Row,
  Col,
  Pagination,
  Label,
} from 'react-bootstrap';
import moment from 'moment';
import BaseRefreshableTab from './BaseRefreshableTab';
import Loading from '../Loading';
import Table from '../Table';
import Modal from '../modal/Modal';
import StatusModal from '../modal/StatusModal';
import dateUtil from '../../common/date-util';

import Api from '../../common/api';

const ASTERISK = '✱';
const DATE_FORMAT = 'YYYY-MM-DD HH:mm';

export default class CurrentStatusTab extends BaseRefreshableTab {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      checkedItems: [],
      page: 1,
      totalCount: 0,
      countPerPage: 10,
      buttonDisabled: {
        add: false,
        modify: true,
        remove: true,
        clone: true,
        activate: true,
      },
      error: null,
      modal: {
        visible: false,
        mode: 'confirm',
        title: '',
        onSuccess: () => {},
        onConfirm: () => {},
        onClose: () => this.setSubState('modal', { visible: false }),
        content: '',
        data: null,
      },
      showLoading: false,
    };

    this.options = {
      statusTypes: props.statusTypes ? props.statusTypes : [],
      deviceTypes: props.deviceTypes ? props.deviceTypes : [],
    };

    this.columns = [
      {
        title: 'ID',
        isChildRow: true,
        display: row => <span>{row.id}</span>,
      },
      {
        title: '상태 타입',
        display: (row) => {
          if (!row.type) { return ''; }
          let typeLabel = 'Unknown';
          for (let i = 0; i < this.options.statusTypes.length; i++) {
            if (row.type === this.options.statusTypes[i].value) {
              typeLabel = this.options.statusTypes[i].label;
              break;
            }
          }
          return <span>{typeLabel}</span>;
        },
      },
      { title: '제목', display: row => <span>{row.title}</span> },
      {
        title: '기간',
        display: (row) => {
          if (!row.startTime || !row.endTime) {
            return <span>{ASTERISK}</span>;
          }
          const start = moment(row.startTime);
          const end = moment(row.endTime);
          const duration = start.from(end, true);
          return <span>{`${dateUtil.formatDate(start, DATE_FORMAT)} ~ ${dateUtil.formatDate(end, DATE_FORMAT)} (${duration})`}</span>;
        },
      },
      {
        title: '디바이스 타입',
        display: (row) => {
          if (!row.deviceTypes) {
            return <span />;
          }
          if (row.deviceTypes.length === this.options.deviceTypes.length) {
            return <span>{ASTERISK}</span>;
          }
          return row.deviceTypes
            ? (
              <span>
                {row.deviceTypes.map((device) => {
                  let typeLabel = 'Unknown';
                  for (let i = 0; i < this.options.deviceTypes.length; i++) {
                    if (device === this.options.deviceTypes[i].value) {
                      typeLabel = this.options.deviceTypes[i].label;
                      break;
                    }
                  }
                  return typeLabel;
                }).join(', ')}
              </span>
            )
            : <span />;
        },
      },
      {
        title: '디바이스 버전',
        display: row => ((row.deviceSemVersion === '*') ? <span>{ASTERISK}</span> : row.deviceSemVersion),
      },
      {
        title: '앱 버전',
        display: row => ((row.appSemVersion === '*') ? <span>{ASTERISK}</span> : row.appSemVersion),
      },
      {
        title: '내용',
        isChildRow: true,
        display: row => (!row.contents ? '' : <span dangerouslySetInnerHTML={{ __html: row.contents }} />),
      },
      {
        title: '활성화',
        display: row => <Label bsStyle={row.isActivated ? 'success' : 'default'}>{row.isActivated ? 'ON' : 'OFF'}</Label>,
      },
    ];
  }

  onCheckboxChanged(checkedItems) {
    let buttonDisabled = { add: false, modify: true, remove: true, clone: true, activate: true };
    if (checkedItems.length === 1) {
      buttonDisabled = { add: false, modify: false, remove: false, clone: false, activate: false };
    } else if (checkedItems.length > 1) {
      buttonDisabled = { add: false, modify: true, remove: false, clone: true, activate: false };
    }
    this.setState({ buttonDisabled, checkedItems });
  }

  remove(items) {
    if (items instanceof Array && items.length > 0) {
      Promise.all(items.map(item => Api.removeStatus(item.id)))
        .then(() => {
          this.refresh();
          this.state.modal.onClose();
        })
        .catch(error => this.setState({ error }));
    }
  }

  setActivation(isActivated, items) {
    if (items instanceof Array && items.length > 0) {
      const api = isActivated ? Api.activateStatus : Api.deactivateStatus;
      Promise.all(items.map(item => api(item.id)))
        .then(() => {
          this.refresh();
          this.state.modal.onClose();
        })
        .catch(error => this.setState({ error }));
    }
  }

  refresh() {
    const {
      page,
      countPerPage,
    } = this.state;

    this.setState({ showLoading: true });
    const offset = (page - 1) * countPerPage;
    const limit = countPerPage;
    return Api.getStatus('current', (page - 1) * offset, limit)
      .then((response) => {
        this.setState({
          items: response.data.data,
          totalCount: response.data.totalCount,
          error: null,
          checkedItems: [],
          showLoading: false,
        });
        this.table.setChecked(false);
      })
      .catch((error) => {
        this.setState({
          items: [],
          totalCount: 0,
          error,
          checkedItems: [],
          showLoading: false,
        });
        this.table.setChecked(false);
      });
  }

  onClickButton(modalName) {
    const { checkedItems } = this.state;
    switch (modalName) {
      case 'add':
        this.setSubState('modal', {
          visible: true,
          mode: 'add',
          onSuccess: () => this.refresh(),
          data: null,
        });
        break;
      case 'clone':
        this.setSubState('modal', {
          visible: true,
          mode: 'add',
          onSuccess: () => this.refresh(),
          data: checkedItems[0],
        });
        break;
      case 'modify':
        this.setSubState('modal', {
          visible: true,
          mode: 'modify',
          onSuccess: () => this.refresh(),
          data: checkedItems[0],
        });
        break;
      case 'remove':
        this.setSubState('modal', {
          visible: true,
          mode: 'confirm',
          title: '삭제 확인',
          onConfirm: () => this.remove(checkedItems),
          content: <p>{checkedItems.length} 건의 데이터를 삭제하시겠습니까?</p>,
        });
        break;
      case 'activate':
        this.setSubState('modal', {
          visible: true,
          mode: 'confirm',
          title: '활성화 확인',
          onConfirm: () => this.setActivation(true, checkedItems),
          content: <p>{checkedItems.length} 건의 데이터를 활성화 하시겠습니까?</p>,
        });
        break;
      case 'deactivate':
        this.setSubState('modal', {
          visible: true,
          mode: 'confirm',
          title: '비활성화 확인',
          onConfirm: () => this.setActivation(false, checkedItems),
          content: <p>{checkedItems.length} 건의 데이터를 비활성화 하시겠습니까?</p>,
        });
        break;
      default:
        break;
    }
  }

  renderModal() {
    const {
      modal,
    } = this.state;

    if (modal.mode === 'add' || modal.mode === 'modify') {
      return (
        <StatusModal
          visible={modal.visible}
          mode={modal.mode}
          options={this.options}
          data={modal.data}
          onSuccess={() => this.refresh()}
          onClose={() => modal.onClose()}
        />
      );
    }
    return (
      <Modal
        visible={modal.visible}
        mode={modal.mode}
        title={modal.title}
        onSuccess={() => modal.onSuccess()}
        onConfirm={() => modal.onConfirm()}
        onClose={() => modal.onClose()}
      >
        {modal.content}
      </Modal>
    );
  }

  render() {
    const {
      items,
      buttonDisabled,
      totalCount,
      page,
      countPerPage,
      error,
    } = this.state;

    return (
      <div>
        <ButtonToolbar>
          <ButtonGroup>
            <Button onClick={() => this.onClickButton('add')} bsSize="small" disabled={buttonDisabled.add}>등록</Button>
            <Button onClick={() => this.onClickButton('clone')} bsSize="small" disabled={buttonDisabled.clone}>복제</Button>
          </ButtonGroup>
          <Button onClick={() => this.onClickButton('modify')} bsSize="small" disabled={buttonDisabled.modify}>수정</Button>
          <ButtonGroup>
            <Button onClick={() => this.onClickButton('activate')} bsSize="small" disabled={buttonDisabled.activate}>활성화</Button>
            <Button onClick={() => this.onClickButton('deactivate')} bsSize="small" disabled={buttonDisabled.activate}>비활성화</Button>
          </ButtonGroup>
          <Button onClick={() => this.onClickButton('remove')} bsSize="small" disabled={buttonDisabled.remove}>삭제</Button>
        </ButtonToolbar>

        <Row className="table-info">
          <Col xs={6} className="table-info-left">총 {totalCount || 0}건의 데이터</Col>
          <Col xs={6} className="table-info-right">{page} / {Math.ceil(totalCount / countPerPage) || 1} 페이지</Col>
        </Row>

        <Table
          ref={(t) => { this.table = t; }}
          items={items}
          columns={this.columns}
          error={error}
          onCheckboxChange={(newCheckedItems => this.onCheckboxChanged(newCheckedItems))}
          onPageChange={newPage => this.setState({ page: newPage }, () => this.refresh())}
          page={page}
          totalPage={Math.ceil(totalCount / countPerPage) || 1}
          showCheckbox
        />
        <div className="text-center">
          <Pagination
            prev
            next
            first
            last
            items={Math.ceil(totalCount / countPerPage) || 1}
            activePage={page || 1}
            onSelect={newPage => this.setState({ page: newPage }, () => this.refresh())}
          />
        </div>
        {this.renderModal()}
        <Loading show={this.state.showLoading} />
      </div>
    );
  }
}

CurrentStatusTab.propTypes = {
  statusTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  deviceTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
};
