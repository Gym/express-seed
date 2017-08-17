import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as mongoose from 'mongoose';
// import { isEmail } from 'validator';

export interface IEmail extends mongoose.Document {
  address: string;
  isPrimary: boolean;
  createdAt?: Date;
  modifiedAt?: Date;
  /* For email validation */
  token?: string;
  confirmedAt?: Date;
}

export class Email {
  static get schema() {
    let schema = new mongoose.Schema({
      address: {
        type: String,
        trim: true,
        required: 'Email address is required.',
        unique: true,
        // validate: [isEmail, 'Please provide a valid email address']
      },
      isPrimary: {
        type: Boolean,
        default: false
      },
      token: String,
      confirmedAt: Date,
      createdAt: {
        type: Date,
        default: Date.now,
        required: false
      },
      modifiedAt: {
        type: Date,
        required: false
      },
    });

    schema.virtual('isConfirmed')
      .get(function () {
        return this.confirmedAt !== undefined;
      });

    /**
     * Hook a pre save method to generate a token
     */
    schema.pre('save', function (next) {
      if (this.isModified('address')) {
        this._emailWasUpdated = true;
        delete this.confirmed;
        this.token = crypto.randomBytes(48).toString('hex');
      }

      next();
    });

    schema.set('toJSON', {
      virtuals: true
    });

    return schema;
  }
}

const model = mongoose.model<IEmail>('email', Email.schema, 'emails', true);

export default model;
