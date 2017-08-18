import BaseTabContainer from './BaseTabContainer';
import StatusTypeTab from './StatusTypeTab';
import DeviceTypeTab from './DeviceTypeTab';

export default class StatusTabContainer extends BaseTabContainer {
  constructor(props) {
    super(props, [
      { eventKey: 'statusType', title: '상태 타입 목록', ChildComponent: StatusTypeTab },
      { eventKey: 'deviceType', title: '디바이스 타입 목록', ChildComponent: DeviceTypeTab },
    ]);
  }
}
