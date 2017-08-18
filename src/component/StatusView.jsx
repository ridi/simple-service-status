import React from 'react';
import PropTypes from 'prop-types';
import StatusTabContainer from './tab/StatusTabContainer';

export default class StatusView extends React.Component {
  render() {
    return (
      <StatusTabContainer
        id="statusTabs"
        statusTypes={this.props.statusTypes}
        deviceTypes={this.props.deviceTypes}
      />
    );
  }
}

StatusView.propTypes = {
  statusTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  deviceTypes: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
};
