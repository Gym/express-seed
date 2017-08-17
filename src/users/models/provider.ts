import * as crypto from 'crypto';
import * as _ from 'lodash';
import * as mongoose from 'mongoose';
// import { isEmail } from 'validator';

export interface IProvider extends mongoose.Document {
  name: string;
  id: string;
  profile: any;
  accessToken: string;
  refreshToken: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export class Provider {
  static get schema() {
    let schema = new mongoose.Schema({
      name: {
        type: String,
        trim: true,
        required: true,
      },
      id: {
        type: String,
        trim: true,
        required: true,
      },
      profile: {},
      accessToken: String,
      refreshToken: String,
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

    schema.set('toJSON', {
      virtuals: true
    });

    return schema;
  }
}

const model = mongoose.model<IProvider>('provider', Provider.schema, 'providers', true);

export default model;
