import * as local from 'passport-local';

import { User, IUser } from '../../models';

export default (options) => new local.Strategy(options, (username: string, password: string, done: Function) => {
  const handleResponse = (err: Error, user: IUser) => {
    if (err) {
      return done(err);
    }

    if (!user || !user.verifyPassword(password)) {
      return done(null, false, {
        message: 'Invalid username or password'
      });
    }

    return done(null, user);
  };

  User.findOne({
    username: username
  }, handleResponse);
});
