/* global window */
import React from 'react';
import PropTypes from 'prop-types';

import { Tabs, Tab } from 'react-bootstrap';

export default class BaseTabContainer extends React.Component {
  constructor(props, configs = []) {
    super(props);

    this.configs = configs;
    this.state = {
      activeTab: window.location.hash ? window.location.hash.substr(1) : this.configs[0].eventKey,
    };
    this.tabs = {};
  }

  componentDidMount() {
    this.refreshTab();
    window.addEventListener('hashchange', () => {
      const activeTab = (window.location.hash) ? window.location.hash.substr(1) : this.configs[0].eventKey;
      this.onTabChanged(activeTab);
    });
  }

  onTabChanged(activeTab) {
    this.setState({ activeTab }, () => this.refreshTab());
    window.location.hash = `#${activeTab}`;
  }

  refreshTab() {
    this.tabs[this.state.activeTab].refresh();
  }

  renderTabs() {
    const tabConfigs = this.configs;
    const inheritProps = Object.assign({}, this.props);
    delete inheritProps.id;

    return tabConfigs.map(tab => (
      <Tab eventKey={tab.eventKey} title={tab.title}>
        {React.createElement(
          tab.ChildComponent,
          Object.assign({
            ref: (elem) => { this.tabs[tab.eventKey] = elem; },
          }, inheritProps),
        )}
      </Tab>
    ));
  }

  render() {
    return (
      <Tabs id={this.props.id} activeKey={this.state.activeTab} onSelect={t => this.onTabChanged(t)}>
        {this.renderTabs()}
      </Tabs>
    );
  }
}

BaseTabContainer.propTypes = {
  id: PropTypes.string.isRequired,
};
