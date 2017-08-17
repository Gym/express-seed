import * as jwt from 'passport-jwt';

import { User, IUser } from '../../models';

import Config from '../../../core/config';

const config = Config.get('authentication');

export default () => {
  const options: jwt.StrategyOptions = {
    secretOrKey: config.secret,
    jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderAsBearerToken()
  };

  return new jwt.Strategy(options, (payload: any, done: Function) => {
    const handleResponse = (err: Error, user: IUser) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    };

    User.findById(payload.id, '-salt -password', handleResponse);
  });
};
