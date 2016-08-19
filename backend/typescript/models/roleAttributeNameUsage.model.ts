import * as mongoose from 'mongoose';
import {IRoleAttributeName, RoleAttributeNameModel} from './roleAttributeName.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameModel = RoleAttributeNameModel;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RoleAttributeNameUsageSchema = new mongoose.Schema({
    optionalInd: {
        type: Boolean,
        default: false,
        required: [true, 'Optional Indicator is required']
    },
    defaultValue: {
      type: String,
      required: false,
      trim: true
    },
    attributeName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleAttributeName'
    }
});

// interfaces .........................................................................................................

export interface IRoleAttributeNameUsage extends mongoose.Document {
    optionalInd: boolean;
    defaultValue?: string;
    attributeName: IRoleAttributeName;
}

/* tslint:disable:no-empty-interfaces */
export interface IRoleAttributeNameUsageModel extends mongoose.Model<IRoleAttributeNameUsage> {
}

// instance methods ...................................................................................................

// static methods .....................................................................................................

// concrete model .....................................................................................................

export const RoleAttributeNameUsageModel = mongoose.model(
    'RoleAttributeNameUsage',
    RoleAttributeNameUsageSchema) as IRoleAttributeNameUsageModel;
