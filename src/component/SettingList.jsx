const React = require('react');

const Table = require('./Table');
const Loading = require('./Loading');

const Tabs = require('react-bootstrap/lib/Tabs');
const Tab = require('react-bootstrap/lib/Tab');
const Row = require('react-bootstrap/lib/Row');
const Col = require('react-bootstrap/lib/Col');

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'statusType',
      showLoading: false,
    };
    this.tables = {};
    this.columns = [
      { title: '라벨', key: 'label' },
      { title: '값', key: 'value' },
    ];
  }

  onTabChanged(activeTab) {
    this.setState({ activeTab }, () => this.refresh(activeTab));
  }

  refresh(/* tabName */) {
    // TODO
  }

  render() {
    return (
      <div>
        <Tabs id="tabsForSettings" activeKey={this.state.activeTab} onSelect={activeTab => this.onTabChanged(activeTab)}>
          <Tab eventKey={'statusType'} title="상태 타입 목록">
            <Row className="table-info">
              <Col xs={6} className="table-info-left">총 {this.props.statusTypes.length}건의 데이터</Col>
              <Col xs={6} className="table-info-right" />
            </Row>
            <Table
              ref={(t) => { this.tables.statusType = t; }}
              items={this.props.statusTypes}
              columns={this.columns}
            />
          </Tab>
          <Tab eventKey={'deviceType'} title="디바이스 타입 목록">
            <Row className="table-info">
              <Col xs={6} className="table-info-left">총 {this.props.deviceTypes.length}건의 데이터</Col>
              <Col xs={6} className="table-info-right" />
            </Row>
            <Table
              ref={(t) => { this.tables.deviceType = t; }}
              items={this.props.deviceTypes}
              columns={this.columns}
            />
          </Tab>
        </Tabs>
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
  statusTypes: React.PropTypes.arrayOf(React.PropTypes.shape({
    label: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
  })),
  deviceTypes: React.PropTypes.arrayOf(React.PropTypes.shape({
    label: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
  })),
};

module.exports = Settings;
