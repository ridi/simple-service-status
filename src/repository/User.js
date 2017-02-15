/**
 * User model
 *
 * @since 1.0.0
 */

const Model = require('./Model');
const authUtil = require('../common/auth-util');

class User extends Model {
  constructor() {
    super('user', [{ key: { username: 1 } }]);
  }

  add(user) {
    const encryptPassword = authUtil.encryptPassword(user);
    return super.add(Object.assign({}, user, { password: encryptPassword }));
  }

  updatePassword(username, newPassword) {
    const encryptPassword = authUtil.encryptPassword({ username, password: newPassword });
    return super.updateWithQuery({ username }, { password: encryptPassword, isTemporary: false });
  }
}

module.exports = new User();
