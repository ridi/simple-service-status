const React = require('react');
const Table = require('./Table');
const Tabs = require('react-bootstrap/lib/Tabs');
const Tab = require('react-bootstrap/lib/Tab');
const Loading = require('./Loading');

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

  refresh(tabName) {

  }

  onTabChanged(activeTab) {
    this.setState({ activeTab }, () => this.refresh(activeTab));
  }

  render() {
    return (
      <div>
        <Tabs activeKey={this.state.activeTab} onSelect={activeTab => this.onTabChanged(activeTab)}>
          <Tab eventKey={'statusType'} title="상태 타입 목록">
            <Table
              ref={(t) => { this.tables.statusType = t; }}
              items={this.props.statusTypes}
              columns={this.columns}
            />
          </Tab>
          <Tab eventKey={'deviceType'} title="디바이스 타입 목록">
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

module.exports = Settings;
