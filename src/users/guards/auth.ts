import acl from '../config/acl';
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

export class AuthGuard {
  public canActivate = (req: Request, res: Response, next: NextFunction): void => {
    const roles = (req.user) ? req.user.roles : ['guest'];

    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), (err, isAllowed) => {
      if (err) {
        return res.status(500).send('Unexpected authorization error');
      }

      if (isAllowed) {
        return next();
      } else if (req.isAuthenticated()) {
        return res.status(403).send('User is not authorized');
      } else {
        return res.status(401).send('User is not authenticated');
      }
    });
  }
}
