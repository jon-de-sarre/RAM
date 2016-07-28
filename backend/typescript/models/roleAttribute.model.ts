import * as mongoose from 'mongoose';
import {RoleModel} from './role.model';
import {IRoleAttributeName, RoleAttributeNameModel} from './roleAttributeName.model';
import {
    IRoleAttribute as DTO
} from '../../../commons/RamAPI';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleModel = RoleModel;

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameModel = RoleAttributeNameModel;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RoleAttributeSchema = new mongoose.Schema({
    value: {
      type: String,
      required: false,
      trim: true
    },
    attributeName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleAttributeName',
        required: true
    }
});

// interfaces .........................................................................................................

export interface IRoleAttribute extends mongoose.Document {
    value?: string;
    attributeName: IRoleAttributeName;
    toDTO():Promise<DTO>;
}

/* tslint:disable:no-empty-interfaces */
export interface IRoleAttributeModel extends mongoose.Model<IRoleAttribute> {
}

// instance methods ...................................................................................................

RoleAttributeSchema.method('toDTO', async function () {
    const dto: DTO = {
        value: this.value,
        attributeName: await this.attributeName.toHrefValue(true)
    };

    return dto;
});

// static methods .....................................................................................................

// concrete model .....................................................................................................

export const RoleAttributeModel = mongoose.model(
    'RoleAttribute',
    RoleAttributeSchema) as IRoleAttributeModel;
