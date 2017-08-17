import * as express from 'express';
import * as passport from 'passport';
import { basename, join, resolve } from 'path';

import { User, IUser } from '../models';
import Config from '../../core/config';

const config = Config.get('authentication');

passport.serializeUser((user: IUser, done: Function) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done: Function) => {
  User.findById(id, '-salt -password', done);
});

for (let strategy of Config.globFiles(resolve(join(__dirname, './strategies/*.ts')))) {
  const key = basename(strategy, '.ts');

  passport.use(key, require(resolve(strategy)).default(config[key]));
}

export default passport;
