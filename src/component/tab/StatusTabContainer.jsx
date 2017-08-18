import BaseTabContainer from './BaseTabContainer';
import CurrentStatusTab from './CurrentStatusTab';
import ExpiredStatusTab from './ExpiredStatusTab';

export default class StatusTabContainer extends BaseTabContainer {
  constructor(props) {
    super(props, [
      { eventKey: 'current', title: '현재 공지사항 목록', ChildComponent: CurrentStatusTab },
      { eventKey: 'expired', title: '만료된 공지사항 목록', ChildComponent: ExpiredStatusTab },
    ]);
  }
}
