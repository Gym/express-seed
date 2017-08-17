import { Request, NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';

import * as passport from 'passport';

import { User, IUser } from '../models';
import Config from '../../core/config';

const config = Config.get('authentication');

export class AuthService {
  public authenticate(req: Request, res: Response, next: NextFunction): void {
    const strategy = req.params.strategy || 'local';

    passport.authenticate(strategy, { session: false}, (err: Error, user: IUser, info: any) => {
      console.log('error', err, 'user', user, 'info', info);

      if (err) {
        res.status(400).send(info);
      } else if (!user && info && info.flow === 'registration') {
        res.status(200).json(info);
      } else {
        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;

        req.logIn(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            const token = jwt.sign({ id: user._id }, config.secret, {
              expiresIn: '86400s' // in seconds
            });

            res.json({ access_token: token, token_type: 'Bearer', expires_in: 86400 });
          }
        });
      }
    })(req, res, next);
  }
}
