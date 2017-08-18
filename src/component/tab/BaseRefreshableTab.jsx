import React from 'react';

export default class BaseRefreshableTab extends React.Component {
  refresh() {
    throw new Error('Should implement this method "refresh()"');
  }
}
