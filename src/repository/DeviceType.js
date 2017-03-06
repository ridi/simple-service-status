/**
 * DeviceType model
 *
 * @since 1.0.0
 */
const Model = require('./Model');

class DeviceType extends Model {
  constructor() {
    super('devicetype', [{ key: { value: 1 }, unique: true }]);
  }
}

module.exports = new DeviceType();
