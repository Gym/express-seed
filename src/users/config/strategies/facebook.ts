import { User, IUser } from '../../models';

import Config from '../../../core/config';

const FacebookTokenStrategy = require('passport-facebook-token');

const config = Config.get('authentication');

export default () => {
  const options: any = {
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret
  };

  return new FacebookTokenStrategy(options, (accessToken: string, refreshToken: string, profile: any, done: Function) => {
    const handleResponse = (err: Error, user: IUser) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    };

    const searchQuery = {
      'providers.name': profile.provider,
      'providers.id': profile.id
    };

    User.findOne(searchQuery, function (err, existingUser) {
      if (err) {
        return done(err);
      }

      if (!existingUser) {
        const info = {
          flow: 'registration',
          name: profile.provider,
          id: profile.id,
          suggested_username: generateUsername(profile),
          suggested_email: profile.emails ? profile.emails[0].value : undefined,
          accessToken: accessToken
        };

        return done(null, false, info);
      }

      const provider = {
        name: profile.provider,
        id: profile.id,
        profile: profile,
        accessToken: accessToken,
        refreshToken: refreshToken
      };

      console.log('existing', existingUser);

      return done(null, existingUser);
    });

    // User.find().byProvider('facebook', profile.id).exec('-salt -password', handleResponse);
  });
};

function generateUsername(profile) {
  let username = '';

  if (profile.username) {
    username = profile.username;
  } else if (profile.emails) {
    username = profile.emails[0].value.split('@')[0];
  } else if (profile.name) {
    username = profile.name.givenName[0] + profile.name.familyName;
  }

  return username.toLowerCase();
}
