import { AuthService, UsersService } from './services';
import { User } from './models';
import Config from '../core/config';

import acl from './config/acl';
import passport from './config/passport';

import { USER_POLICIES } from './config';

import { AuthGuard } from './guards';

export default class UsersModule {
  private guard: AuthGuard;
  private auth: AuthService;
  private users: UsersService;

  constructor(private app) {
    this.guard = new AuthGuard();
    this.auth = new AuthService();
    this.users = new UsersService();

    this.security();
    this.middleware();
  }

  private middleware = () => {
    this.app.route('/auth/:strategy').post(this.auth.authenticate);

    this.app.route('/login').post(this.auth.authenticate);
    this.app.route('/users').post(this.users.create);
    this.app.route('/users').put(this.users.update);
    this.app.route('/users').get(this.guard.canActivate, this.users.retrieve);
    this.app.route('/users/:userId').get(this.guard.canActivate, this.users.retrieve);

    this.app.route('/account').get(this.guard.canActivate, this.users.retrieve);

    this.app.param('userId', this.users.getById);
  }

  private security = () => {
    this.app.use(passport.initialize());
    this.app.use((req, res, next) => passport.authenticate('jwt', (err, user) =>
      req.logIn(user, { session: false }, next))(req, res, next));

    acl.allow(USER_POLICIES);
  }
}
