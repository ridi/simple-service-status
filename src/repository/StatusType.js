/**
 * DeviceType model
 *
 * @since 1.0.0
 */

const Model = require('./Model');

class StatusType extends Model {
  constructor() {
    super('statustype', [{ key: { value: 1 }, unique: true }]);
  }
}

module.exports = new StatusType();
