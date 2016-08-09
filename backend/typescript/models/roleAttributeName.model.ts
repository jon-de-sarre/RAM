import * as mongoose from 'mongoose';
import {RAMEnum, ICodeDecode, CodeDecodeSchema} from './base';
import {Url} from './url';
import {HrefValue, RoleAttributeName as DTO} from '../../../commons/RamAPI';

// enums, utilities, helpers ..........................................................................................

// see https://github.com/atogov/RAM/wiki/Relationship-Attribute-Types
export class RoleAttributeNameDomain extends RAMEnum {

    public static Null = new RoleAttributeNameDomain('NULL', 'NULL');
    public static Boolean = new RoleAttributeNameDomain('BOOLEAN', 'BOOLEAN');
    public static Number = new RoleAttributeNameDomain('NUMBER', 'NUMBER');
    public static String = new RoleAttributeNameDomain('STRING', 'STRING');
    public static Date = new RoleAttributeNameDomain('DATE', 'DATE');
    public static Markdown = new RoleAttributeNameDomain('MARKDOWN', 'MARKDOWN');
    public static SelectSingle = new RoleAttributeNameDomain('SELECT_SINGLE', 'SELECT_SINGLE');
    public static SelectMulti = new RoleAttributeNameDomain('SELECT_MULTI', 'SELECT_MULTI');

    protected static AllValues = [
        RoleAttributeNameDomain.Null,
        RoleAttributeNameDomain.Boolean,
        RoleAttributeNameDomain.Number,
        RoleAttributeNameDomain.String,
        RoleAttributeNameDomain.Date,
        RoleAttributeNameDomain.Markdown,
        RoleAttributeNameDomain.SelectSingle,
        RoleAttributeNameDomain.SelectMulti
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

export class RoleAttributeNameClassifier extends RAMEnum {

    public static AgencyService = new RoleAttributeNameClassifier('AGENCY_SERVICE', 'Agency Service');
    public static Other = new RoleAttributeNameClassifier('OTHER', 'Other');
    public static Permission = new RoleAttributeNameClassifier('PERMISSION', 'Permission');

    protected static AllValues = [
        RoleAttributeNameClassifier.AgencyService,
        RoleAttributeNameClassifier.Other,
        RoleAttributeNameClassifier.Permission
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

// schema .............................................................................................................

const RoleAttributeNameSchema = CodeDecodeSchema({
    domain: {
        type: String,
        required: [true, 'Domain is required'],
        trim: true,
        enum: RoleAttributeNameDomain.valueStrings()
    },
    classifier: {
        type: String,
        required: [true, 'Classifier is required'],
        trim: true,
        enum: RoleAttributeNameClassifier.valueStrings()
    },
    category: {
        type: String,
        trim: true
    },
    purposeText: {
        type: String,
        required: [true, 'Purpose Text is required'],
        trim: true
    },
    permittedValues: [{
        type: String
    }]
});

// interfaces .........................................................................................................

export interface IRoleAttributeName extends ICodeDecode {
    domain: string;
    classifier: string;
    category?: string;
    purposeText: string;
    permittedValues: string[];
    domainEnum(): RoleAttributeNameDomain;
    toHrefValue(includeValue:boolean): Promise<HrefValue<DTO>>;
    toDTO(): Promise<DTO>;
}

export interface IRoleAttributeNameModel extends mongoose.Model<IRoleAttributeName> {
    findByCodeIgnoringDateRange: (code:string) => Promise<IRoleAttributeName>;
    findByCodeInDateRange: (code:string, date:Date) => Promise<IRoleAttributeName>;
    listIgnoringDateRange: () => Promise<IRoleAttributeName[]>;
    listInDateRange: (date:Date) => Promise<IRoleAttributeName[]>;
}

// instance methods ...................................................................................................

RoleAttributeNameSchema.method('domainEnum', function () {
    return RoleAttributeNameDomain.valueOf(this.domain);
});

RoleAttributeNameSchema.method('toHrefValue', async function (includeValue:boolean) {
    return new HrefValue(
        await Url.forRoleAttributeName(this),
        includeValue ? await this.toDTO() : undefined
    );
});

RoleAttributeNameSchema.method('toDTO', async function () {
    return new DTO(
        this.code,
        this.shortDecodeText,
        this.longDecodeText,
        this.startDate,
        this.endDate,
        this.shortDecodeText,
        this.domain,
        this.classifier,
        this.category,
        this.permittedValues
    );
});

// static methods .....................................................................................................

RoleAttributeNameSchema.static('findByCodeIgnoringDateRange', (code:string) => {
    return this.RoleAttributeNameModel
        .findOne({
            code: code
        })
        .exec();
});

RoleAttributeNameSchema.static('findByCodeInDateRange', (code:string, date:Date) => {
    return this.RoleAttributeNameModel
        .findOne({
            code: code,
            startDate: {$lte: date},
            $or: [{endDate: null}, {endDate: {$gte: date}}]
        })
        .exec();
});

RoleAttributeNameSchema.static('listIgnoringDateRange', () => {
    return this.RoleAttributeNameModel
        .find({
        })
        .deepPopulate([
            'attributeNameUsages.attributeName'
        ])
        .sort({name: 1})
        .exec();
});

RoleAttributeNameSchema.static('listInDateRange', (date:Date) => {
    return this.RoleAttributeNameModel
        .find({
            startDate: {$lte: date},
            $or: [{endDate: null}, {endDate: {$gte: date}}]
        })
        .deepPopulate([
            'attributeNameUsages.attributeName'
        ])
        .sort({name: 1})
        .exec();
});

// concrete model .....................................................................................................

export const RoleAttributeNameModel = mongoose.model(
    'RoleAttributeName',
    RoleAttributeNameSchema) as IRoleAttributeNameModel;
