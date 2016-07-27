import * as mongoose from 'mongoose';
import {ICodeDecode, CodeDecodeSchema} from './base';

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const LegislativeProgramSchema = CodeDecodeSchema({
});

// interfaces .........................................................................................................

export interface ILegislativeProgram extends ICodeDecode {
}

export interface ILegislativeProgramModel extends mongoose.Model<ILegislativeProgram> {
    findByCodeIgnoringDateRange: (code:String) => Promise<ILegislativeProgram>;
    findByCodeInDateRange: (code:String, date:Date) => Promise<ILegislativeProgram>;
    listIgnoringDateRange: () => Promise<ILegislativeProgram[]>;
    listInDateRange: (date:Date) => Promise<ILegislativeProgram[]>;
}

// instance methods ...................................................................................................

// static methods .....................................................................................................

LegislativeProgramSchema.static('findByCodeIgnoringDateRange', (code:String) => {
    return this.LegislativeProgramModel
        .findOne({
            code: code
        })
        .exec();
});

LegislativeProgramSchema.static('findByCodeInDateRange', (code:String, date:Date) => {
    return this.LegislativeProgramModel
        .findOne({
            code: code,
            startDate: {$lte: date},
            $or: [{endDate: null}, {endDate: {$gte: date}}]
        })
        .exec();
});

LegislativeProgramSchema.static('listIgnoringDateRange', () => {
    return this.LegislativeProgramModel
        .find({
        })
        .sort({shortDecodeText: 1})
        .exec();
});

LegislativeProgramSchema.static('listInDateRange', (date:Date) => {
    return this.LegislativeProgramModel
        .find({
            startDate: {$lte: date},
            $or: [{endDate: null}, {endDate: {$gte: date}}]
        })
        .sort({shortDecodeText: 1})
        .exec();
});

// concrete model .....................................................................................................

export const LegislativeProgramModel = mongoose.model(
    'LegislativeProgram',
    LegislativeProgramSchema) as ILegislativeProgramModel;
