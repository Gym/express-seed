import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import { IEmail, Email } from './email';
import { IProvider, Provider } from './provider';

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  displayName: string;
  emails: IEmail[];
  username: string;
  password: string;
  salt: string;
  phone?: string;
  providers: IProvider[];
  roles: string[];
  createdAt?: Date;
  modifiedAt?: Date;
  /* For reset password */
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  verifyPassword(password: string): boolean;
  hashPassword(password: string): string;
}

class User {
  static get schema() {
    let schema = new mongoose.Schema({
      firstName: {
        type: String,
        trim: true,
        default: '',
        validate: [isValidLocalStrategyProperty, 'Please fill in your first name']
      },
      lastName: {
        type: String,
        trim: true,
        default: '',
        validate: [isValidLocalStrategyProperty, 'Please fill in your last name']
      },
      displayName: {
        type: String,
        trim: true
      },
      emails: [Email.schema],
      username: {
        type: String,
        unique: 'Username already exists',
        required: 'Please fill in a username',
        trim: true
      },
      password: {
        type: String,
        default: '',
        validate: [isValidLocalStrategyPassword, 'Password should be longer']
      },
      salt: String,
      phone: {
        type: String,
        trim: true
      },
      providers: [Provider.schema],
      roles: {
        type: [{
          type: String,
          enum: ['user', 'admin']
        }],
        default: ['user']
      },
      createdAt: {
        type: Date,
        default: Date.now,
        required: false
      },
      modifiedAt: {
        type: Date,
        required: false
      },
      /* For reset password */
      resetPasswordToken: String,
      resetPasswordExpires: Date
    });

    schema.virtual('primaryEmail')
      .get(function () {
        if (this.emails.length) {
          return _.result(_.find(this.emails, function (email: IEmail) {
            return email.isPrimary;
          }), 'address');
        }

        return false;
      });

    schema.pre('save', function (next) {
      if (this._doc) {
        let doc = <IUser>this._doc;
        let now = new Date();

        doc.modifiedAt = now;
      }

      next();

      return this;
    });

    /**
     * Create instance method for hashing a password
     */
    schema.methods.hashPassword = function (password) {
      if (this.salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
      } else {
        return password;
      }
    };

    /**
     * Create instance method for authenticating user
     */
    schema.methods.verifyPassword = function (password) {
      return this.password === this.hashPassword(password);
    };

    schema.set('toJSON', {
      virtuals: true
    });

    return schema;
  }
}

/**
 * A Validation function for local strategy properties
 */
function isValidLocalStrategyProperty(property: string): boolean {
  return (!!property.length || (!_.isEmpty(this.providers) && !this.updated));
}

/**
 * A Validation function for local strategy password
 */
function isValidLocalStrategyPassword(password: string): boolean {
  return ((password && password.length > 6) || !_.isEmpty(this.providers));
}

const model = mongoose.model<IUser>('user', User.schema, 'users', true);

export default model;
