import { Request, NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';

import * as passport from 'passport';
import { LocalStrategyInfo } from 'passport-local';

import { User, IUser } from '../models';
import Config from '../../core/config';

const config = Config.get('authentication');

export class UsersService {
  public create(req: Request, res: Response): void {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    // Init Variables
    var user = new User(req.body);
    var message = null;

    // Add missing user fields
    // user.provider = 'local';
    user.displayName = user.firstName + ' ' + user.lastName;

    // Then save the user
    user.save((err): void => {
      if (err) {
        res.status(400).send({
          message: err// errorHandler.getErrorMessage(err)
        });
      } else {
        // Remove sensitive data before login
        user.password = undefined;
        user.salt = undefined;

        res.json(user);
        // req.login(user, function (err) {
        //   if (err) {
        //     res.status(400).send(err);
        //   } else {
        //     res.json(user);
        //   }
        // });
      }
    });

  }

  public getById(req: Request, res: Response, next: NextFunction, id: string): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).send({
        message: 'User is invalid'
      });

      return;
    }

    User.findById(id, '-salt -password').exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load user ' + id));
      }

      res.locals.model = user;

      next();
    });
  }

  public retrieve(req: Request, res: Response): void {
    res.json(req.user);
  }

  public update(req: Request, res: Response) {
    console.log(req.body);

    res.status(400).send({
      message: 'User is not signed in'
    });
  }


  public saveProvider(req: Request, providerProfile: any, done) {
    const searchProviderIdentifierField = 'providers.' + providerProfile.provider + '.' + providerProfile.providerIdentifierField;

    let providerSearchQuery = {};
    providerSearchQuery[searchProviderIdentifierField] = providerProfile.providerData[providerProfile.providerIdentifierField];

    User.findOne(providerSearchQuery, function (err, user) {
      if (err) {
        return done(err);
      }

      console.log(user);

      // if (req.user) {
      //   if (user) {
      //     // TODO: update callback handling (message/redirectURL flow);
      //     if (req.user.providers && req.user.providers[providerProfile.provider] &&
      //       req.user.providers[providerProfile.provider][providerProfile.providerIdentifierField] === providerProfile.providerData[providerProfile.providerIdentifierField]) {
      //       return done(null, req.user, { message: 'User is already connected using this provider', redirectURL: '/settings/accounts' });
      //     } else {
      //       return done(null, req.user, { message: 'This provider is connected to another account.', redirectURL: '/settings/accounts' });
      //     }
      //   }

      //   user = req.user;

      //   if (!user.providers) user.providers = {};

      //   user.providers[providerProfile.provider] = providerProfile.providerData;
      //   user.markModified('providers');

      //   // And save the user
      //   user.save(function (err) {
      //     return done(err, user, '/settings/accounts');
      //   });
      // } else if (!user) {
      //   var possibleUsername = providerProfile.username || ((providerProfile.emails && providerProfile.emails[0]) ? providerProfile.emails[0].address.split('@')[0] : '');

      //   User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
      //     user = new User({
      //       firstName: providerProfile.firstName,
      //       lastName: providerProfile.lastName,
      //       username: availableUsername,
      //       displayName: providerProfile.displayName,
      //       emails: providerProfile.emails,
      //       profileImageURL: providerProfile.profileImageURL,
      //       providers: {}
      //     });

      //     user.providers[providerProfile.provider] = providerProfile.providerData;

      //     // And save the user
      //     user.save(function (err) {
      //       return done(err, user);
      //     });
      //   });
      // } else {
      //   return done(err, user);
      // }
    });
  }
}
