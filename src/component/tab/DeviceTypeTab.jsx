import React from 'react';
import {
  ButtonToolbar,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import BaseRefreshableTab from './BaseRefreshableTab';
import Table from '../Table';
import Loading from '../Loading';
import Api from '../../common/api';

export default class DeviceTypeTab extends BaseRefreshableTab {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      error: null,
      showLoading: false,
    };

    this.columns = [
      { title: '라벨', key: 'label' },
      { title: '값', key: 'value' },
    ];
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
      })
      .catch((error) => {
        this.setState({
          items: [],
          totalCount: 0,
          error,
          checkedItems: [],
          showLoading: false,
        });
      });
  }

  render() {
    const {
      items,
      error,
    } = this.state;

    return (
      <div>
        <Row className="table-info">
          <Col xs={6} className="table-info-left">총 {items.length}건의 데이터</Col>
          <Col xs={6} className="table-info-right" />
        </Row>
        <Table
          items={items}
          columns={this.columns}
          error={error}
        />
        <Loading show={this.state.showLoading} />
      </div>
    );
  }
}
