import * as mongoose from 'mongoose';
import {IRAMObject, RAMSchema, Query} from './base';
import {IRoleType} from './roleType.model';
import {IRoleAttribute, RoleAttributeModel} from './roleAttribute.model';
import {
    Link,
    HrefValue,
    Role as DTO,
    RoleAttribute as RoleAttributeDTO,
    SearchResult
} from '../../../commons/RamAPI';
import {IParty, PartyModel} from './party.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _RoleAttributeModel = RoleAttributeModel;

const MAX_PAGE_SIZE = 10;

// enums, utilities, helpers ..........................................................................................

// schema .............................................................................................................

const RoleSchema = RAMSchema({
    roleType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleType',
        required: [true, 'Role Type is required']
    },
    startTimestamp: {
        type: Date,
        required: [true, 'Start Timestamp is required']
    },
    endTimestamp: {
        type: Date,
        set: function (value: String) {
            if (value) {
                this.endEventTimestamp = new Date();
            }
            return value;
        }
    },
    endEventTimestamp: {
        type: Date,
        required: [function () {
            return this.endTimestamp;
        }, 'End Event Timestamp is required']
    },
    attributes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleAttribute'
    }],
    _roleTypeCode: {
        type: String,
        required: [true, 'Role Type Code is required'],
        trim: true
    }
});

RoleSchema.pre('validate', function (next: () => void) {
    if (this.roleType) {
        this._roleTypeCode = this.roleType.code;
    }
    next();
});

// interfaces .........................................................................................................

export interface IRole extends IRAMObject {
    roleType:IRoleType;
    startTimestamp:Date;
    endTimestamp?:Date;
    endEventTimestamp?:Date;
    attributes:IRoleAttribute[];
    _roleTypeCode:string;
    toHrefValue(includeValue: boolean):Promise<HrefValue<DTO>>;
    toDTO(invitationCode: string):Promise<DTO>;
}

export interface IRoleModel extends mongoose.Model<IRole> {
    add:(roleType: IRoleType,
         startTimestamp: Date,
         endTimestamp: Date,
         attributes: IRoleAttribute[]) => Promise<IRole>;
    search:(page: number, pageSize: number)
        => Promise<SearchResult<IRole>>;
    searchByIdentity:(identityIdValue: string, page: number, pageSize: number)
        => Promise<SearchResult<IRole>>;
}

// instance methods ...................................................................................................

RoleSchema.method('toHrefValue', async function (includeValue: boolean) {
    const roleId: string = this._id.toString();
    return new HrefValue(
        '/api/v1/role/' + encodeURIComponent(roleId),
        includeValue ? await this.toDTO(null) : undefined
    );
});

RoleSchema.method('toDTO', async function () {
    const links: Link[] = [];
    // links.push(new Link('self', `/api/v1/role/${this.id}`));

    return new DTO(
        links,
        await this.roleType.toHrefValue(false),
        this.startTimestamp,
        this.endTimestamp,
        this.endEventTimestamp,
        await Promise.all<RoleAttributeDTO>(this.attributes.map(
            async (attribute: IRoleAttribute) => {
                return await attribute.toDTO();
            }))
    );
});

// static methods .....................................................................................................

RoleSchema.static('add', async (roleType: IRoleType,
                                        startTimestamp: Date,
                                        endTimestamp: Date,
                                        attributes: IRoleAttribute[]) => {
    return await this.RoleModel.create({
        roleType: roleType,
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp,
        attributes: attributes
    });
});

RoleSchema.static('search', (page: number,
                             reqPageSize: number) => {
    return new Promise<SearchResult<IRole>>(async (resolve, reject) => {
        const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        try {
            const query = await (new Query()
                .build());
            const count = await this.RoleModel
                .count(query)
                .exec();
            const list = await this.RoleModel
                .find(query)
                .deepPopulate([
                    'roleType',
                    'attributes.attributeName'
                ])
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .sort({name: 1})
                .exec();
            resolve(new SearchResult<IRole>(page, count, pageSize, list));
        } catch (e) {
            reject(e);
        }
    });
});

/* tslint:disable:max-func-body-length */
RoleSchema.static('searchByIdentity', (identityIdValue: string, page: number, reqPageSize: number) => {
    return new Promise<SearchResult<IRole>>(async (resolve, reject) => {
        const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        try {
            const party = await PartyModel.findByIdentityIdValue(identityIdValue);
            const where: Object = {};
            where['$and'] = [];
            // where['$and'].push({'$or': [{subject: party}, {delegate: party}]});
            const count = await this.RoleModel
                .count(where)
                .exec();
            const list = await this.RoleModel
                .find(where)
                .deepPopulate([
                    'roleType',
                    'attributes.attributeName'
                ])
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .exec();
            resolve(new SearchResult<IRole>(page, count, pageSize, list));
        } catch (e) {
            reject(e);
        }
    });
});

// concrete model .....................................................................................................

export const RoleModel = mongoose.model(
    'Role',
    RoleSchema) as IRoleModel;