/**
 * User model
 *
 * @since 1.0.0
 */

const Model = require('./Model');
const util = require('../common/util');

class User extends Model {
  constructor() {
    super('user', [{ key: { username: 1 } }]);
  }

  add(user) {
    const encryptPassword = util.encryptPassword(user);
    return super.add({ username: user.username, password: encryptPassword, role: user.role });
  }
}

module.exports = new User();
