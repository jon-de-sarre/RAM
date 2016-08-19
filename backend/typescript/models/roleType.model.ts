import * as mongoose from 'mongoose';
import {ICodeDecode, CodeDecodeSchema} from './base';
import {Url} from './url';
import {RoleAttributeNameModel} from './roleAttributeName.model';
import {IRoleAttributeNameUsage, RoleAttributeNameUsageModel} from './roleAttributeNameUsage.model';
import {
    HrefValue,
    RoleType as DTO,
    RoleAttributeNameUsage as RoleAttributeNameUsageDTO
} from '../../../commons/RamAPI';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameModel = RoleAttributeNameModel;

/* tslint:disable:no-unused-variable */
const _RoleAttributeNameUsageModel = RoleAttributeNameUsageModel;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RoleTypeSchema = CodeDecodeSchema({
    attributeNameUsages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleAttributeNameUsage'
    }]
});

// interfaces .........................................................................................................

export interface IRoleType extends ICodeDecode {
    attributeNameUsages: IRoleAttributeNameUsage[];
    toHrefValue(includeValue:boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

export interface IRoleTypeModel extends mongoose.Model<IRoleType> {
    findByCodeIgnoringDateRange: (code:String) => Promise<IRoleType>;
    findByCodeInDateRange: (code:String, date:Date) => Promise<IRoleType>;
    listIgnoringDateRange: () => Promise<IRoleType[]>;
    listInDateRange: (date:Date) => Promise<IRoleType[]>;
}

// instance methods ...................................................................................................

RoleTypeSchema.method('toHrefValue', async function (includeValue:boolean) {
    return new HrefValue(
        await Url.forRoleType(this),
        includeValue ? await this.toDTO() : undefined
    );
});

RoleTypeSchema.method('toDTO', async function () {
    return new DTO(
        this.code,
        this.shortDecodeText,
        this.longDecodeText,
        this.startDate,
        this.endDate,
        await Promise.all<RoleAttributeNameUsageDTO>(this.attributeNameUsages.map(
            async (attributeNameUsage:IRoleAttributeNameUsage) => {
                return new RoleAttributeNameUsageDTO(
                    attributeNameUsage.optionalInd,
                    attributeNameUsage.defaultValue,
                    await attributeNameUsage.attributeName.toHrefValue(true)
                );
            }))
    );
});

// static methods .....................................................................................................

RoleTypeSchema.static('findByCodeIgnoringDateRange', (code:String) => {
    return this.RoleTypeModel
        .findOne({
            code: code
        })
        .deepPopulate([
            'attributeNameUsages.attributeName'
        ])
        .exec();
});

RoleTypeSchema.static('findByCodeInDateRange', (code:String, date:Date) => {
    return this.RoleTypeModel
        .findOne({
            code: code,
            startDate: {$lte: date},
            $or: [{endDate: null}, {endDate: {$gte: date}}]
        })
        .deepPopulate([
            'attributeNameUsages.attributeName'
        ])
        .exec();
});

RoleTypeSchema.static('listIgnoringDateRange', () => {
    return this.RoleTypeModel
        .find({
        })
        .deepPopulate([
            'attributeNameUsages.attributeName'
        ])
        .sort({shortDecodeText: 1})
        .exec();
});

RoleTypeSchema.static('listInDateRange', (date:Date) => {
    return this.RoleTypeModel
        .find({
            startDate: {$lte: date},
            $or: [{endDate: null}, {endDate: {$gte: date}}]
        })
        .deepPopulate([
            'attributeNameUsages.attributeName'
        ])
        .sort({shortDecodeText: 1})
        .exec();
});

// concrete model .....................................................................................................

export const RoleTypeModel = mongoose.model(
    'RoleType',
    RoleTypeSchema) as IRoleTypeModel;
