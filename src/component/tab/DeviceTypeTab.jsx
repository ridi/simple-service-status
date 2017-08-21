import React from 'react';
import {
  ButtonToolbar,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import BaseRefreshableTab from './BaseRefreshableTab';
import Modal from '../modal/Modal';
import DeviceTypeModal from '../modal/DeviceTypeModal';
import Table from '../Table';
import Loading from '../Loading';
import Api from '../../common/api';

export default class DeviceTypeTab extends BaseRefreshableTab {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      checkedItems: [],
      buttonDisabled: {
        add: false,
        modify: true,
        remove: true,
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

    this.columns = [
      { title: '라벨', key: 'label' },
      { title: '값', key: 'value' },
    ];
  }

  onCheckboxChanged(checkedItems) {
    let buttonDisabled = { add: false, modify: true, remove: true };
    if (checkedItems.length === 1) {
      buttonDisabled = { add: false, modify: false, remove: false };
    } else if (checkedItems.length > 1) {
      buttonDisabled = { add: false, modify: true, remove: false };
    }
    this.setState({ buttonDisabled, checkedItems });
  }

  remove(items) {
    if (items instanceof Array && items.length > 0) {
      Promise.all(items.map(item => Api.removeDeviceType(item.id)))
        .then(() => {
          this.refresh();
          this.state.modal.onClose();
        })
        .catch(error => this.setState({ error }));
    }
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
        <DeviceTypeModal
          visible={modal.visible}
          mode={modal.mode}
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

  refresh() {
    this.setState({ showLoading: true });
    return Api.getDeviceTypes()
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

  render() {
    const {
      buttonDisabled,
      items,
      error,
    } = this.state;

    return (
      <div>
        <ButtonToolbar>
          <Button onClick={() => this.onClickButton('add')} bsSize="small" disabled={buttonDisabled.add}>등록</Button>
          <Button onClick={() => this.onClickButton('modify')} bsSize="small" disabled={buttonDisabled.modify}>수정</Button>
          <Button onClick={() => this.onClickButton('remove')} bsSize="small" disabled={buttonDisabled.remove}>삭제</Button>
        </ButtonToolbar>

        <Row className="table-info">
          <Col xs={6} className="table-info-left">총 {items.length}건의 데이터</Col>
          <Col xs={6} className="table-info-right" />
        </Row>
        <Table
          ref={(t) => { this.table = t; }}
          items={items}
          columns={this.columns}
          error={error}
          onCheckboxChange={(newCheckedItems => this.onCheckboxChanged(newCheckedItems))}
          showCheckbox
        />
        {this.renderModal()}
        <Loading show={this.state.showLoading} />
      </div>
    );
  }
}
