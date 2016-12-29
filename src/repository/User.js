const Model = require('./Model');

// FIXME remove it!
const users = {
  admin: {
    password: 'admin',
    username: 'admin',
    role: 'WRITE',
  },
};

class User extends Model {
  find(username) {
    return Promise.resolve(users[username]);
  }

  save(user) {
    if (user.username) {
      users[user.username] = user;
    }
    return Promise.resolve();
  }

  currentUser() {

  }

}

module.exports = new User();
