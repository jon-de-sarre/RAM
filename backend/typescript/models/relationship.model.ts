import * as mongoose from 'mongoose';
import {RAMEnum, IRAMObject, RAMSchema, Query, Assert} from './base';
import {DOB_SHARED_SECRET_TYPE_CODE} from './sharedSecretType.model';
import {IParty, PartyModel} from './party.model';
import {IName, NameModel} from './name.model';
import {IRelationshipType} from './relationshipType.model';
import {IRelationshipAttribute, RelationshipAttributeModel} from './relationshipAttribute.model';
import {IdentityModel, IIdentity, IdentityType, IdentityInvitationCodeStatus} from './identity.model';
import {
    Link,
    HrefValue,
    Relationship as DTO,
    RelationshipStatus as RelationshipStatusDTO,
    RelationshipAttribute as RelationshipAttributeDTO,
    SearchResult
} from '../../../commons/RamAPI';
import {logger} from '../logger';
import {IdentityPublicIdentifierScheme} from './identity.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _PartyModel = PartyModel;

/* tslint:disable:no-unused-variable */
const _NameModel = NameModel;

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeModel = RelationshipAttributeModel;

const MAX_PAGE_SIZE = 10;

// enums, utilities, helpers ..........................................................................................

export class RelationshipStatus extends RAMEnum {

    public static Active = new RelationshipStatus('ACTIVE', 'Active');
    public static Cancelled = new RelationshipStatus('CANCELLED', 'Cancelled');
    public static Deleted = new RelationshipStatus('DELETED', 'Deleted');
    public static Invalid = new RelationshipStatus('INVALID', 'Invalid');
    public static Pending = new RelationshipStatus('PENDING', 'Pending');

    protected static AllValues = [
        RelationshipStatus.Active,
        RelationshipStatus.Cancelled,
        RelationshipStatus.Deleted,
        RelationshipStatus.Invalid,
        RelationshipStatus.Pending
    ];

    constructor(name:string, decodeText:string) {
        super(name, decodeText);
    }

    public toHrefValue(includeValue:boolean): HrefValue<RelationshipStatusDTO> {
        return new HrefValue(
            '/api/v1/relationshipStatus/' + this.name,
            includeValue ? this.toDTO() : undefined
        );
    }

    public toDTO(): RelationshipStatusDTO {
        return new RelationshipStatusDTO(this.name, this.decodeText);
    }
}

// schema .............................................................................................................

const RelationshipSchema = RAMSchema({
    relationshipType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RelationshipType',
        required: [true, 'Relationship Type is required']
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: [true, 'Subject is required']
    },
    subjectNickName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Name',
        required: [true, 'Subject Nick Name is required']
    },
    delegate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: [true, 'Delegate is required']
    },
    delegateNickName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Name',
        required: [true, 'Delegate Nick Name is required']
    },
    invitationIdentity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Identity'
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
    status: {
        type: String,
        required: [true, 'Status is required'],
        trim: true,
        enum: RelationshipStatus.valueStrings()
    },
    attributes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RelationshipAttribute'
    }],
    _relationshipTypeCode: {
        type: String,
        required: [true, 'Relationship Type Code is required'],
        trim: true
    },
    _subjectNickNameString: {
        type: String,
        required: [true, 'Subject Nick Name String is required'],
        trim: true
    },
    _delegateNickNameString: {
        type: String,
        required: [true, 'Delegate NickName String is required'],
        trim: true
    },
    _subjectABNString: {
        type: String,
        trim: true
    },
    _delegateABNString: {
        type: String,
        trim: true
    },
    _subjectPartyTypeCode: {
        type: String,
        required: [true, 'Subject Party Type Code is required'],
        trim: true
    },
    _delegatePartyTypeCode: {
        type: String,
        required: [true, 'Delegate Party Type Code is required'],
        trim: true
    },
    _subjectProfileProviderCodes: [{
        type: String
    }],
    _delegateProfileProviderCodes: [{
        type: String
    }]
});

RelationshipSchema.pre('validate', function (next:() => void) {
    if (this.relationshipType) {
        this._relationshipTypeCode = this.relationshipType.code;
    }
    if (this.subjectNickName) {
        this._subjectNickNameString = this.subjectNickName._displayName;
    }
    if (this.delegateNickName) {
        this._delegateNickNameString = this.delegateNickName._displayName;
    }
    this._subjectPartyTypeCode = this.subject.partyType;
    this._delegatePartyTypeCode = this.delegate.partyType;
    const subjectPromise = IdentityModel.listByPartyId(this.subject.id)
        .then((identities: IIdentity[]) => {
            this._subjectProfileProviderCodes = [];
            for (let identity of identities) {
                this._subjectProfileProviderCodes.push(identity.profile.provider);
                if (identity.publicIdentifierScheme === IdentityPublicIdentifierScheme.ABN.name) {
                    this._subjectABNString = identity.rawIdValue;
                }
            }
        });
    const delegatePromise = IdentityModel.listByPartyId(this.delegate.id)
        .then((identities: IIdentity[]) => {
            this._delegateProfileProviderCodes = [];
            for (let identity of identities) {
                this._delegateProfileProviderCodes.push(identity.profile.provider);
                if (identity.publicIdentifierScheme === IdentityPublicIdentifierScheme.ABN.name) {
                    this._delegateABNString = identity.rawIdValue;
                }
            }
        });
    Promise.all([subjectPromise, delegatePromise])
        .then(() => {
            next();
        })
        .catch((err:Error) => {
            next();
        });
});

// interfaces .........................................................................................................

export interface IRelationship extends IRAMObject {
    relationshipType:IRelationshipType;
    subject:IParty;
    subjectNickName:IName;
    delegate:IParty;
    delegateNickName:IName;
    startTimestamp:Date;
    endTimestamp?:Date;
    endEventTimestamp?:Date;
    status:string;
    attributes:IRelationshipAttribute[];
    _subjectNickNameString:string;
    _delegateNickNameString:string;
    _subjectABNString:string;
    _delegateABNString:string;
    _subjectPartyTypeCode:string;
    _delegatePartyTypeCode:string;
    _relationshipTypeCode:string;
    _subjectProfileProviderCodes:string[];
    _delegateProfileProviderCodes:string[];
    statusEnum():RelationshipStatus;
    toHrefValue(includeValue:boolean):Promise<HrefValue<DTO>>;
    toDTO(invitationCode:string):Promise<DTO>;
    claimPendingInvitation(claimingDelegateIdentity:IIdentity):Promise<IRelationship>;
    acceptPendingInvitation(acceptingDelegateIdentity:IIdentity):Promise<IRelationship>;
    rejectPendingInvitation(rejectingDelegateIdentity:IIdentity):Promise<IRelationship>;
    notifyDelegate(email:string):Promise<IRelationship>;
}

export interface IRelationshipModel extends mongoose.Model<IRelationship> {
    findByIdentifier:(id:string) => Promise<IRelationship>;
    findByInvitationCode:(invitationCode:string) => Promise<IRelationship>;
    findPendingByInvitationCodeInDateRange:(invitationCode:string, date:Date) => Promise<IRelationship>;
    search:(subjectIdentityIdValue:string, delegateIdentityIdValue:string, page:number, pageSize:number)
        => Promise<SearchResult<IRelationship>>;
    searchByIdentity:(identityIdValue: string,
                      partyType: string,
                      relationshipType: string,
                      profileProvider: string,
                      status: string,
                      text: string,
                      sort: string,
                      page: number, pageSize: number) => Promise<SearchResult<IRelationship>>;
    searchDistinctSubjectsBySubjectOrDelegateIdentity:(identityIdValue:string, page:number, pageSize:number)
        => Promise<SearchResult<IParty>>;
}

// instance methods ...................................................................................................

RelationshipSchema.method('statusEnum', function () {
    return RelationshipStatus.valueOf(this.status);
});

RelationshipSchema.method('toHrefValue', async function (includeValue:boolean) {
    const relationshipId:string = this._id.toString();
    return new HrefValue(
        '/api/v1/relationship/' + encodeURIComponent(relationshipId),
        includeValue ? await this.toDTO(null) : undefined
    );
});

RelationshipSchema.method('toDTO', async function (invitationCode?:string) {
console.log('toDTO on ', this);
    const links:Link[] = [];
    // links.push(new Link('self', `/api/v1/relationship/${this.id}`));

    // TODO what other logic around when to add links?
    if (invitationCode && this.statusEnum() === RelationshipStatus.Pending) {
        links.push(new Link('accept', `/api/v1/relationship/invitationCode/${invitationCode}/accept`));
        links.push(new Link('reject', `/api/v1/relationship/invitationCode/${invitationCode}/reject`));
        links.push(new Link('notifyDelegate', `/api/v1/relationship/invitationCode/${invitationCode}/notifyDelegate`));
    }

    return new DTO(
        links,
        await this.relationshipType.toHrefValue(false),
        await this.subject.toHrefValue(true),
        await this.subjectNickName.toDTO(),
        await this.delegate.toHrefValue(true),
        await this.delegateNickName.toDTO(),
        this.startTimestamp,
        this.endTimestamp,
        this.endEventTimestamp,
        this.status,
        await Promise.all<RelationshipAttributeDTO>(this.attributes.map(
            async(attribute:IRelationshipAttribute) => {
                return await attribute.toDTO();
            }))
    );
});

RelationshipSchema.method('claimPendingInvitation', async function (claimingDelegateIdentity:IIdentity) {
    try {
        /* validate */

        // validate current status
        Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to accept a non-pending relationship');

        // find identity to match user against
        const invitationIdentities = await IdentityModel.listByPartyId(this.delegate.id);
        Assert.assertTrue(invitationIdentities.length === 1, 'A pending relationship should only have one delegate identity');

        const invitationIdentity = invitationIdentities[0];

        // check invitation code is valid
        Assert.assertTrue(
            invitationIdentity.identityTypeEnum() === IdentityType.InvitationCode,
            'Must be an invitation code to claim'
        );
        Assert.assertTrue(
            invitationIdentity.invitationCodeStatusEnum() === IdentityInvitationCodeStatus.Pending,
            'Invitation code must be pending'
        );
        Assert.assertTrue(
            invitationIdentity.invitationCodeExpiryTimestamp > new Date(),
            'Invitation code has expired'
        );

        // check name
        Assert.assertTrue(
            claimingDelegateIdentity.profile.name.givenName === invitationIdentity.profile.name.givenName,
            'Identity does not match',
            `${claimingDelegateIdentity.profile.name.givenName} != ${invitationIdentity.profile.name.givenName}`
        );

        Assert.assertTrue(
            claimingDelegateIdentity.profile.name.familyName === invitationIdentity.profile.name.familyName,
            'Identity does not match',
            `${claimingDelegateIdentity.profile.name.familyName} != ${invitationIdentity.profile.name.familyName}`
        );

        // TODO not sure about this implementation
        // check date of birth IF it is recorded on the invitation
        if (invitationIdentity.profile.getSharedSecret(DOB_SHARED_SECRET_TYPE_CODE)) {
            //
            // Assert.assertTrue(
            //      acceptingDelegateIdentity.profile.getSharedSecret(DOB_SHARED_SECRET_TYPE_CODE)
            //     identity.profile.getSharedSecret(DOB_SHARED_SECRET_TYPE_CODE).matchesValue(),
            //     'Identity does not match');
        }

        // TODO credentials strengths (not spec'ed out yet)

        /* complete claim */

        // mark invitation code identity as claimed
        invitationIdentity.invitationCodeStatus = IdentityInvitationCodeStatus.Claimed.name;
        invitationIdentity.invitationCodeClaimedTimestamp = new Date();
        await invitationIdentity.save();

        // point relationship to the accepting delegate identity
        this.delegate = claimingDelegateIdentity.party;
        await this.save();
        return Promise.resolve(this);
    } catch (err) {
        return Promise.reject(err);
    }
});

RelationshipSchema.method('acceptPendingInvitation', async function (acceptingDelegateIdentity:IIdentity) {
    logger.debug('Attempting to accept relationship by ', acceptingDelegateIdentity.idValue);
    logger.debug('Relationship ', JSON.stringify(this));
    Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to accept a non-pending relationship');

    // confirm the delegate is the user accepting
    Assert.assertTrue(acceptingDelegateIdentity.party.id === this.delegate.id, 'Not allowed');

    // mark relationship as active
    this.status = RelationshipStatus.Active.name;
    await this.save();

    // TODO notify relevant parties

    return Promise.resolve(this);
});

RelationshipSchema.method('rejectPendingInvitation', async function (rejectingDelegateIdentity:IIdentity) {

    Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to reject a non-pending relationship');

    // confirm the delegate is the user accepting
    Assert.assertTrue(rejectingDelegateIdentity.party.id === this.delegate.id, 'Not allowed');

    // mark relationship as invalid
    this.status = RelationshipStatus.Invalid.name;
    await this.save();

    // TODO notify relevant parties

    return this;
});

RelationshipSchema.method('notifyDelegate', async function (email:string) {

    if (this.statusEnum() === RelationshipStatus.Pending) {

        // save email
        // as relationship doesn't have a pointer to the identity, this sets email on all invitation identities
        // associated with the temporary delegate (there should only be one)
        const identities = await IdentityModel.listByPartyId(this.delegate.id);
        for (let identity of identities) {
            if (identity.identityTypeEnum() === IdentityType.InvitationCode &&
                identity.invitationCodeStatusEnum() === IdentityInvitationCodeStatus.Pending) {
                identity.invitationCodeTemporaryEmailAddress = email;
                await identity.save();
            }
        }

        // TODO notify relevant parties

        return Promise.resolve(this);
    } else {
        throw new Error('Unable to update relationship with delegate email');
    }

});

// RelationshipSchema.method('identitiesByTypeAndStatus', async function (identityType:IdentityType, status:IdentityInvitationCodeStatus) {
//      const identities = await IdentityModel.listByPartyId(this.delegate.id);
//     return identities.filter((identity) => identity.identityTypeEnum() === identityType
//             && identity.invitationCodeStatusEnum() === status)
// });

// static methods .....................................................................................................

RelationshipSchema.static('findByIdentifier', (id:string) => {
    // TODO migrate from _id to another id
    return this.RelationshipModel
        .findOne({
            _id: id
        })
        .deepPopulate([
            'relationshipType',
            'subject',
            'subjectNickName',
            'delegate',
            'delegateNickName',
            'attributes.attributeName'
        ])
        .exec();
});

RelationshipSchema.static('findByInvitationCode', async(invitationCode:string) => {
    const identity = await IdentityModel.findByInvitationCode(invitationCode);
    if (identity) {
        const delegate = identity.party;
        return await this.RelationshipModel
            .findOne({
                invitationIdentity: identity
            })
            .deepPopulate([
                'relationshipType',
                'subject',
                'subjectNickName',
                'delegate',
                'delegateNickName',
                'attributes.attributeName'
            ])
            .exec();
    }
    return null;
});

RelationshipSchema.static('findPendingByInvitationCodeInDateRange', async(invitationCode:string, date:Date) => {
    const identity = await IdentityModel.findPendingByInvitationCodeInDateRange(invitationCode, date);
    if (identity) {
        const delegate = identity.party;
        return this.RelationshipModel
            .findOne({
                delegate: delegate
            })
            .deepPopulate([
                'relationshipType',
                'subject',
                'subjectNickName',
                'delegate',
                'delegateNickName',
                'attributes.attributeName'
            ])
            .exec();
    }
    return null;
});

// todo this search might no longer be useful from SS2
RelationshipSchema.static('search', (subjectIdentityIdValue:string, delegateIdentityIdValue:string, page:number, reqPageSize:number) => {
    return new Promise<SearchResult<IRelationship>>(async(resolve, reject) => {
        const pageSize:number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        try {
            const query = await (new Query()
                .when(subjectIdentityIdValue, 'subject', () => PartyModel.findByIdentityIdValue(subjectIdentityIdValue))
                .when(delegateIdentityIdValue, 'delegate', () => PartyModel.findByIdentityIdValue(delegateIdentityIdValue))
                .build());
            const count = await this.RelationshipModel
                .count(query)
                .exec();
            const list = await this.RelationshipModel
                .find(query)
                .deepPopulate([
                    'relationshipType',
                    'subject',
                    'subjectNickName',
                    'delegate',
                    'delegateNickName',
                    'attributes.attributeName'
                ])
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .sort({name: 1})
                .exec();
            resolve(new SearchResult<IRelationship>(page, count, pageSize, list));
        } catch (e) {
            reject(e);
        }
    });
});

// todo need to optional filters (term, party type, relationship type, status)
// todo need to add sorting
/* tslint:disable:max-func-body-length */
RelationshipSchema.static('searchByIdentity', (identityIdValue: string,
                                               partyType: string,
                                               relationshipType: string,
                                               profileProvider: string,
                                               status: string,
                                               text: string,
                                               sort: string,
                                               page: number,
                                               reqPageSize: number) => {
    return new Promise<SearchResult<IRelationship>>(async(resolve, reject) => {
        const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        try {
            const party = await PartyModel.findByIdentityIdValue(identityIdValue);
            const where: Object = {};
            where['$and'] = [];
            where['$and'].push({'$or': [{subject: party}, {delegate: party}]});
            if (partyType) {
                where['$and'].push({
                    '$or': [
                        {'_delegatePartyTypeCode': partyType},
                        {'_subjectPartyTypeCode': partyType}
                    ]
                });
            }
            if (relationshipType) {
                where['$and'].push({'_relationshipTypeCode': relationshipType});
            }
            if (profileProvider) {
                where['$and'].push({
                    '$or': [
                        {'_delegateProfileProviderCodes': profileProvider},
                        {'_subjectProfileProviderCodes': profileProvider}
                    ]
                });
            }
            if (status) {
                where['$and'].push({'status': status});
            }
            if (text) {
                where['$and'].push({
                    '$or': [
                        {'_subjectNickNameString': new RegExp(text, 'i')},
                        {'_delegateNickNameString': new RegExp(text, 'i')},
                        {'_subjectABNString': new RegExp(text, 'i')},
                        {'_delegateABNString': new RegExp(text, 'i')}
                    ]
                });
            }
            const count = await this.RelationshipModel
                .count(where)
                .exec();
            const list = await this.RelationshipModel
                .find(where)
                .deepPopulate([
                    'relationshipType',
                    'subject',
                    'subjectNickName',
                    'delegate',
                    'delegateNickName',
                    'attributes.attributeName'
                ])
                .sort({
                    '_subjectNickNameString': !sort || sort === 'asc' ? 1 : -1,
                    '_delegateNickNameString': !sort || sort === 'asc' ? 1 : -1
                })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .sort({name: 1})
                .exec();
            resolve(new SearchResult<IRelationship>(page, count, pageSize, list));
        } catch (e) {
            reject(e);
        }
    });
});

/**
 * Returns a paginated list of distinct subjects for relationships which have a subject or delegate matching the one supplied.
 *
 * todo need to optional filters (term, party type, relationship type, status)
 * todo need to add sorting
 * todo this search might no longer be useful after SS2 spike
 */
/* tslint:disable:max-func-body-length */
RelationshipSchema.static('searchDistinctSubjectsBySubjectOrDelegateIdentity',
    (identityIdValue:string, page:number, reqPageSize:number) => {
        return new Promise<SearchResult<IParty>>(async(resolve, reject) => {
            const pageSize:number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
            try {
                const party = await PartyModel.findByIdentityIdValue(identityIdValue);
                const listForCount = await this.RelationshipModel
                    .distinct('subject', {
                        '$or': [
                            {subject: party},
                            {delegate: party}
                        ]
                    })
                    .exec();
                const count = listForCount.length;
                const listOfIds = await this.RelationshipModel
                    .aggregate([
                        {
                            '$match': {
                                '$or': [
                                    {'subject': new mongoose.Types.ObjectId(party.id)},
                                    {'delegate': new mongoose.Types.ObjectId(party.id)}
                                ]
                            }
                        },
                        {'$group': {'_id': '$subject'}},
                        {'$skip': (page - 1) * pageSize},
                        {'$limit': pageSize}
                    ])
                    .exec();
                const inflatedList = (await PartyModel.populate(listOfIds, {path: '_id'})).map((item:{_id:string}) => item._id);
                resolve(new SearchResult<IParty>(page, count, pageSize, inflatedList));
            } catch (e) {
                reject(e);
            }
        });
    });

// concrete model .....................................................................................................

export const RelationshipModel = mongoose.model(
    'Relationship',
    RelationshipSchema) as IRelationshipModel;