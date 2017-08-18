import React from 'react';

// TODO showLoading도 여기서 관리하도록 변경
export default class BaseRefreshableTab extends React.Component {
  // TODO util로 분류하기
  setSubState(key, state) {
    const newState = Object.assign({}, this.state[key], state);
    this.setState({ [key]: newState });
  }

  refresh() {
    // TODO refresh 코드도 공통화
    throw new Error('Should implement this method "refresh()"');
  }
}
