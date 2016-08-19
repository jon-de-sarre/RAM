import * as mongoose from 'mongoose';
import {RAMEnum, IRAMObject, RAMSchema, Query, Assert} from './base';
import {Url} from './url';
import {DOB_SHARED_SECRET_TYPE_CODE} from './sharedSecretType.model';
import {IParty, PartyModel} from './party.model';
import {IName, NameModel} from './name.model';
import {IRelationshipType, RelationshipTypeModel} from './relationshipType.model';
import {IRelationshipAttribute, RelationshipAttributeModel} from './relationshipAttribute.model';
import {RelationshipAttributeNameModel} from './relationshipAttributeName.model';
import {IdentityModel, IIdentity, IdentityType, IdentityInvitationCodeStatus} from './identity.model';
import {context} from '../providers/context.provider';
import {
    HrefValue,
    Relationship as DTO,
    RelationshipStatus as RelationshipStatusDTO,
    RelationshipAttribute as RelationshipAttributeDTO,
    SearchResult
} from '../../../commons/RamAPI';
// import {logger} from '../logger';
import {IdentityPublicIdentifierScheme} from './identity.model';
import {logger} from '../logger';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _PartyModel = PartyModel;

/* tslint:disable:no-unused-variable */
const _NameModel = NameModel;

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeModel = RelationshipAttributeModel;

/* tslint:disable:no-unused-variable */
const _RelationshipAttributeNameModel = RelationshipAttributeNameModel;

/* tslint:disable:no-unused-variable */
const _RelationshipTypeModel = RelationshipTypeModel;

const MAX_PAGE_SIZE = 10;

// enums, utilities, helpers ..........................................................................................

export class RelationshipStatus extends RAMEnum {

    public static Accepted = new RelationshipStatus('ACCEPTED', 'Accepted');
    public static Cancelled = new RelationshipStatus('CANCELLED', 'Cancelled');
    public static Declined = new RelationshipStatus('DECLINED', 'Declined');
    public static Deleted = new RelationshipStatus('DELETED', 'Deleted');
    public static Pending = new RelationshipStatus('PENDING', 'Pending');
    public static Revoked = new RelationshipStatus('REVOKED', 'Revoked');
    public static Suspended = new RelationshipStatus('SUSPENDED', 'Suspended');

    protected static AllValues = [
        RelationshipStatus.Accepted,
        RelationshipStatus.Cancelled,
        RelationshipStatus.Declined,
        RelationshipStatus.Deleted,
        RelationshipStatus.Pending,
        RelationshipStatus.Revoked,
        RelationshipStatus.Suspended
    ];

    constructor(code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
    }

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<RelationshipStatusDTO>> {
        return Promise.resolve(new HrefValue(
            await Url.forRelationshipStatus(this),
            includeValue ? this.toDTO() : undefined
        ));
    }

    public toDTO(): RelationshipStatusDTO {
        return new RelationshipStatusDTO(this.code, this.shortDecodeText);
    }
}

export class RelationshipInitiatedBy extends RAMEnum {

    public static Subject = new RelationshipInitiatedBy('SUBJECT', 'Subject');
    public static Delegate = new RelationshipInitiatedBy('DELEGATE', 'Delegate');

    protected static AllValues = [
        RelationshipInitiatedBy.Subject,
        RelationshipInitiatedBy.Delegate
    ];

    constructor(code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
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
    initiatedBy: {
        type: String,
        required: [true, 'Initiated by is required'],
        trim: true,
        enum: RelationshipInitiatedBy.valueStrings()
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
    _relationshipTypeCategory: {
         type: String,
         required: [true, 'Relationship Type Category is required'],
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

RelationshipSchema.pre('validate', function (next: () => void) {
    if (this.relationshipType) {
        this._relationshipTypeCode = this.relationshipType.code;
    }
    if (this.relationshipType) {
        this._relationshipTypeCategory = this.relationshipType.category;
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
                if (identity.publicIdentifierScheme === IdentityPublicIdentifierScheme.ABN.code) {
                    this._subjectABNString = identity.rawIdValue;
                }
            }
        });
    const delegatePromise = IdentityModel.listByPartyId(this.delegate.id)
        .then((identities: IIdentity[]) => {
            this._delegateProfileProviderCodes = [];
            for (let identity of identities) {
                this._delegateProfileProviderCodes.push(identity.profile.provider);
                if (identity.publicIdentifierScheme === IdentityPublicIdentifierScheme.ABN.code) {
                    this._delegateABNString = identity.rawIdValue;
                }
            }
        });
    Promise.all([subjectPromise, delegatePromise])
        .then(() => {
            next();
        })
        .catch((err: Error) => {
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
    initiatedBy:string;
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
    toHrefValue(includeValue: boolean):Promise<HrefValue<DTO>>;
    toDTO(invitationCode: string):Promise<DTO>;
    claimPendingInvitation(claimingDelegateIdentity: IIdentity):Promise<IRelationship>;
    acceptPendingInvitation(acceptingDelegateIdentity: IIdentity):Promise<IRelationship>;
    rejectPendingInvitation(rejectingDelegateIdentity: IIdentity):Promise<IRelationship>;
    notifyDelegate(email: string, notifyingIdentity: IIdentity):Promise<IRelationship>;
    modify(dto: DTO): Promise<IRelationship>;
}

export interface IRelationshipModel extends mongoose.Model<IRelationship> {
    add2:(relationshipType: IRelationshipType,
          subject: IParty,
          subjectNickName: IName,
          delegate: IParty,
          delegateNickName: IName,
          startTimestamp: Date,
          endTimestamp: Date,
          initiatedBy: RelationshipInitiatedBy,
          invitationIdentity: IIdentity,
          attributes: IRelationshipAttribute[]) => Promise<IRelationship>;
    findByIdentifier:(id: string) => Promise<IRelationship>;
    findByInvitationCode:(invitationCode: string) => Promise<IRelationship>;
    findPendingByInvitationCodeInDateRange:(invitationCode: string, date: Date) => Promise<IRelationship>;
    hasActiveInDateRange1stOr2ndLevelConnection:(requestingParty: IParty, requestedIdValue: string, date:Date) => Promise<boolean>;
    search:(subjectIdentityIdValue: string, delegateIdentityIdValue: string, page: number, pageSize: number) => Promise<SearchResult<IRelationship>>;
    searchByIdentity:(identityIdValue: string,
                      partyType: string,
                      relationshipType: string,
                      relationshipTypeCategory: string,
                      profileProvider: string,
                      status: string,
                      inDateRange: boolean,
                      text: string,
                      sort: string,
                      page: number,
                      pageSize: number) => Promise<SearchResult<IRelationship>>;
    searchByIdentitiesInDateRange: (subjectIdValue: string,
                                    delegateIdValue: string,
                                    relationshipType: string,
                                    status: string,
                                    date: Date,
                                    page: number,
                                    pageSize: number) => Promise<SearchResult<IRelationship>>;
    searchDistinctSubjectsForMe: (requestingParty: IParty, partyType: string, authorisationManagement:string, text: string, sort: string,page: number, pageSize: number)
        => Promise<SearchResult<IParty>>;
}

// instance methods ...................................................................................................

RelationshipSchema.method('statusEnum', function () {
    return RelationshipStatus.valueOf(this.status);
});

// todo what is the href we use here?
RelationshipSchema.method('toHrefValue', async function (includeValue: boolean) {
    return new HrefValue(
        await Url.forRelationship(this),
        includeValue ? await this.toDTO(null) : undefined
    );
});

// todo need to use security context to drive the links
RelationshipSchema.method('toDTO', async function (invitationCode?: string) {
    const pendingWithInvitationCode = invitationCode && this.statusEnum() === RelationshipStatus.Pending;
    return new DTO(
        Url.links()
            .push('self', Url.GET, await Url.forRelationship(this))
            .push('accept', Url.POST, await Url.forRelationshipAccept(invitationCode), pendingWithInvitationCode)
            .push('reject', Url.POST, await Url.forRelationshipReject(invitationCode), pendingWithInvitationCode)
            .push('notifyDelegate', Url.POST, await Url.forRelationshipNotifyDelegate(invitationCode), pendingWithInvitationCode)
            .push('modify', Url.PUT, await Url.forRelationship(this))
            .toArray(),
        await this.relationshipType.toHrefValue(false),
        await this.subject.toHrefValue(true),
        await this.subjectNickName.toDTO(),
        await this.delegate.toHrefValue(true),
        await this.delegateNickName.toDTO(),
        this.startTimestamp,
        this.endTimestamp,
        this.endEventTimestamp,
        this.status,
        this.initiatedBy,
        await Promise.all<RelationshipAttributeDTO>(this.attributes.map(
            async (attribute: IRelationshipAttribute) => {
                return await attribute.toDTO();
            }))
    );
});

RelationshipSchema.method('claimPendingInvitation', async function (claimingDelegateIdentity: IIdentity) {
    try {
        /* validate */

        // validate current status
        Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to accept a non-pending relationship');

        // if the user is already the delegate then there is nothing to do
        if (this.delegate.id === claimingDelegateIdentity.party.id) {
            return this;
        }

        // find identity to match user against
        const invitationIdentities = await IdentityModel.listByPartyId(this.delegate.id);
        Assert.assertTrue(
            invitationIdentities.length === 1,
            'A pending relationship should only have one delegate identity'
        );

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
        Assert.assertCaseInsensitiveEqual(
            claimingDelegateIdentity.profile.name.givenName,
            invitationIdentity.profile.name.givenName,
            'Identity does not match',
            `${claimingDelegateIdentity.profile.name.givenName} != ${invitationIdentity.profile.name.givenName}`
        );

        Assert.assertCaseInsensitiveEqual(
            claimingDelegateIdentity.profile.name.familyName,
            invitationIdentity.profile.name.familyName,
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

        // If we received ABN from headers (ie from AUSkey), check it against ABN in relationship
        const abn = context.getAuthenticatedABN();
        logger.info('abn is <' + abn + '>');
        if (abn) {
            logger.info('checking abn');
            const allIdentities = await IdentityModel.listByPartyId(this.subject.id);
            let found:boolean = false;
            for (let identity of allIdentities) {
                logger.info('abn for identity is ' + identity.rawIdValue);
                if (identity.rawIdValue === abn) {
                    found = true;
                }
            }
            Assert.assertTrue(
                found,
                'You cannot accept an authorisation with an AUSkey from a different ABN. AUSkeys only have authorisation for the ABN they are issued under.'
            );
        }

        // TODO credentials strengths (not spec'ed out yet)

        /* complete claim */

        // mark invitation code identity as claimed
        invitationIdentity.invitationCodeStatus = IdentityInvitationCodeStatus.Claimed.code;
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

RelationshipSchema.method('acceptPendingInvitation', async function (acceptingDelegateIdentity: IIdentity) {

    //logger.debug('Attempting to accept relationship by ', acceptingDelegateIdentity.idValue);

    Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to accept a non-pending relationship');

    // confirm the delegate is the user accepting
    Assert.assertTrue(acceptingDelegateIdentity.party.id === this.delegate.id, 'Not allowed');

    // mark relationship as active
    this.status = RelationshipStatus.Accepted.code;
    await this.save();

    // TODO notify relevant parties

    return Promise.resolve(this);
});

RelationshipSchema.method('rejectPendingInvitation', async function (rejectingDelegateIdentity: IIdentity) {

    Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to reject a non-pending relationship');

    // confirm the delegate is the user accepting
    Assert.assertTrue(rejectingDelegateIdentity.party.id === this.delegate.id, 'Not allowed');

    // mark relationship as invalid
    this.status = RelationshipStatus.Declined.code;
    await this.save();

    // TODO notify relevant parties

    return this;
});

RelationshipSchema.method('notifyDelegate', async function (email: string, notifyingIdentity: IIdentity) {

    const identity = this.invitationIdentity;
    // TODO Assert that the user is an administrator of the subject
    // Assert.assertEqual(notifyingIdentity.party.id, this.subject.id, 'Not allowed');
    Assert.assertTrue(this.statusEnum() === RelationshipStatus.Pending, 'Unable to update relationship with delegate email');
    Assert.assertTrue(identity.identityTypeEnum() === IdentityType.InvitationCode, 'Unable to update relationship with delegate email');
    Assert.assertTrue(
        identity.invitationCodeStatusEnum() === IdentityInvitationCodeStatus.Pending,
        'Unable to update relationship with delegate email'
    );

    identity.invitationCodeTemporaryEmailAddress = email;
    await identity.save();

    // TODO notify relevant parties
    //logger.debug(`TODO Send notification to ${email}`);

    return Promise.resolve(this);

});

RelationshipSchema.method('modify', async function (dto: DTO) {
    const relationshipTypeCode = decodeURIComponent(Url.lastPathElement(dto.relationshipType.href));
    Assert.assertNotNull(relationshipTypeCode, 'Relationship type code was empty', `Expected relationshipType href last element to be the code: ${dto.relationshipType.href}`);

    const relationshipType = await RelationshipTypeModel.findByCodeInDateRange(relationshipTypeCode, new Date());
    Assert.assertNotNull(relationshipType, 'Relationship type not found', `Expected relationship type with code with valid date: ${relationshipTypeCode}`);

    const delegateIdValue = decodeURIComponent(Url.lastPathElement(dto.delegate.href));
    Assert.assertNotNull(delegateIdValue, 'Delegate identity id value was empty', `Expected delegate href last element to have an id value: ${dto.delegate.href}`);

    const delegateIdentity = await IdentityModel.findByIdValue(delegateIdValue);
    Assert.assertNotNull(delegateIdentity, 'Delegate identity not found', `Expected to find delegate by id value: ${delegateIdValue}`);

    const subjectIdValue = decodeURIComponent(Url.lastPathElement(dto.subject.href));
    Assert.assertNotNull(subjectIdValue, 'Subject identity id value was empty', `Expected subject href last element to have an id value: ${dto.subject.href}`);

    const subjectIdentity = await IdentityModel.findByIdValue(subjectIdValue);
    Assert.assertNotNull(subjectIdentity, 'Subject identity not found', `Expected to find subject by id: ${this.id}`);

    // future story to change the below to be configuration based and not hard coded
    let attributes: IRelationshipAttribute[] = [];
    for (let attr of dto.attributes) {
        Assert.assertNotNull(attr.attributeName, 'Attribute did not have an attribute name');
        Assert.assertNotNull(attr.attributeName.href, 'Attribute did not have an attribute name href');

        const attributeNameCode = decodeURIComponent(Url.lastPathElement(attr.attributeName.href));
        Assert.assertNotNull(attributeNameCode, 'Attribute name code not found', `Unexpected attribute name href last element: ${attr.attributeName.href}`);

        const attributeName = await RelationshipAttributeNameModel.findByCodeIgnoringDateRange(attributeNameCode);
        Assert.assertNotNull(attributeName, 'Attribute name not found', `Expected to find attribuet name with code: ${attributeNameCode}`);

        let attribute: IRelationshipAttribute = await RelationshipAttributeModel.add(attr.value, attributeName);
        attributes.push(attribute);
    }

    this.startTimestamp = dto.startTimestamp;
    this.endTimestamp = dto.endTimestamp;
    this.attributes = attributes;

    this.startTimestamp.setHours(0, 0, 0);
    if (this.endTimestamp) {
        this.endTimestamp.setHours(0, 0, 0);
    }

    await this.save();

    return this;
});

// RelationshipSchema.method('identitiesByTypeAndStatus', async function (identityType:IdentityType, status:IdentityInvitationCodeStatus) {
//      const identities = await IdentityModel.listByPartyId(this.delegate.id);
//     return identities.filter((identity) => identity.identityTypeEnum() === identityType
//             && identity.invitationCodeStatusEnum() === status)
// });

// static methods .....................................................................................................

RelationshipSchema.static('add2', async (relationshipType: IRelationshipType,
                                        subject: IParty,
                                        subjectNickName: IName,
                                        delegate: IParty,
                                        delegateNickName: IName,
                                        startTimestamp: Date,
                                        endTimestamp: Date,
                                        initiatedBy: RelationshipInitiatedBy,
                                        invitationIdentity: IIdentity,
                                        attributes: IRelationshipAttribute[]) => {

    let status = RelationshipStatus.Pending;

    // check subject
    if (initiatedBy === RelationshipInitiatedBy.Subject && relationshipType.autoAcceptIfInitiatedFromSubject) {
        status = RelationshipStatus.Accepted;
    }

    // check delegate
    if (initiatedBy === RelationshipInitiatedBy.Delegate && relationshipType.autoAcceptIfInitiatedFromDelegate) {
        status = RelationshipStatus.Accepted;
    }

    return await this.RelationshipModel.create({
        relationshipType: relationshipType,
        subject: subject,
        subjectNickName: subjectNickName,
        delegate: delegate,
        delegateNickName: delegateNickName,
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp,
        status: status.code,
        initiatedBy: initiatedBy.code,
        invitationIdentity: invitationIdentity,
        attributes: attributes
    });
});

RelationshipSchema.static('findByIdentifier', (id: string) => {
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
            'invitationIdentity.profile.name',
            'attributes.attributeName'
        ])
        .exec();
});

RelationshipSchema.static('findByInvitationCode', async (invitationCode: string) => {
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
                'invitationIdentity.profile.name',
                'attributes.attributeName'
            ])
            .exec();
    }
    return null;
});

RelationshipSchema.static('findPendingByInvitationCodeInDateRange', async (invitationCode: string, date: Date) => {
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
                'invitationIdentity',
                'attributes.attributeName'
            ])
            .exec();
    }
    return null;
});

// todo what about start date?
RelationshipSchema.static('hasActiveInDateRange1stOr2ndLevelConnection', async (requestingParty: IParty,
                                                                                requestedIdValue: string,
                                                                                date:Date) => {

    const requestedParty = await PartyModel.findByIdentityIdValue(requestedIdValue);

    if (!requestedParty) {
        // no such subject
        return Promise.resolve(null);
    } else {

        // 1st level

        const firstLevelRelationship = await this.RelationshipModel
            .findOne({
                subject: requestedParty,
                delegate: requestingParty,
                status: RelationshipStatus.Accepted.code,
                startTimestamp: {$lte: date},
                $or: [{endTimestamp: null}, {endTimestamp: {$gte: date}}]
            })
            .exec();

        if (firstLevelRelationship) {
            return true;
        } else {

            // 2nd level

            const listOfDelegateIds = await this.RelationshipModel
                .aggregate([
                    {
                        '$match': {
                            '$and': [
                                {'subject': new mongoose.Types.ObjectId(requestedParty.id)},
                                {'status': RelationshipStatus.Accepted.code},
                                {'startTimestamp': {$lte: date}},
                                {'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]}
                            ]
                        }
                    },
                    {'$group': {'_id': '$delegate'}}
                ])
                .exec();

            const listOfSubjectIds = await this.RelationshipModel
                .aggregate([
                    {
                        '$match': {
                            '$and': [
                                {'delegate': new mongoose.Types.ObjectId(requestingParty.id)},
                                {'status': RelationshipStatus.Accepted.code},
                                {'startTimestamp': {$lte: date}},
                                {'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]}
                            ]
                        }
                    },
                    {'$group': {'_id': '$subject'}}
                ])
                .exec();

            let arrays = [
                listOfDelegateIds.map((obj: {_id: string}): string => obj['_id'].toString()),
                listOfSubjectIds.map((obj: {_id: string}) => obj['_id'].toString())
            ];

            const listOfIntersectingPartyIds = arrays.shift().filter(function (v: string) {
                return arrays.every(function (a) {
                    return a.indexOf(v) !== -1;
                });
            });

            return listOfIntersectingPartyIds.length > 0;

        }

    }

});

// todo this search might no longer be useful from SS2
RelationshipSchema.static('search', (subjectIdentityIdValue: string,
                                     delegateIdentityIdValue: string,
                                     page: number,
                                     reqPageSize: number) => {
    return new Promise<SearchResult<IRelationship>>(async (resolve, reject) => {
        const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
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

/* tslint:disable:max-func-body-length */
RelationshipSchema.static('searchByIdentity', (identityIdValue: string,
                                               partyType: string,
                                               relationshipType: string,
                                               relationshipTypeCategory: string,
                                               profileProvider: string,
                                               status: string,
                                               inDateRange: boolean,
                                               text: string,
                                               sort: string,
                                               page: number,
                                               reqPageSize: number) => {
    return new Promise<SearchResult<IRelationship>>(async (resolve, reject) => {
        const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        try {
            const party = await PartyModel.findByIdentityIdValue(identityIdValue);
            let mainAnd: {[key: string]: Object}[] = [];
            mainAnd.push({
                '$or': [
                    {subject: party},
                    {delegate: party}
                ]
            });
            if (partyType) {
                mainAnd.push({
                    '$or': [
                        {'_delegatePartyTypeCode': partyType},
                        {'_subjectPartyTypeCode': partyType}
                    ]
                });
            }
            if (relationshipType) {
                mainAnd.push({'_relationshipTypeCode': relationshipType});
            }
            if (relationshipTypeCategory) {
                mainAnd.push({'_relationshipTypeCategory': relationshipTypeCategory});
            }
            if (profileProvider) {
                mainAnd.push({
                    '$or': [
                        {'_delegateProfileProviderCodes': profileProvider},
                        {'_subjectProfileProviderCodes': profileProvider}
                    ]
                });
            }
            if (status) {
                mainAnd.push({'status': status});
            }
            if (inDateRange) {
                const date = new Date();
                mainAnd.push({'startTimestamp': {$lte: date}});
                mainAnd.push({'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]});
            }
            if (text) {
                mainAnd.push({
                    '$or': [
                        {'_subjectNickNameString': new RegExp(text, 'i')},
                        {'_delegateNickNameString': new RegExp(text, 'i')},
                        {'_subjectABNString': new RegExp(text, 'i')},
                        {'_delegateABNString': new RegExp(text, 'i')}
                    ]
                });
            }
            const where: {[key: string]: Object} = {};
            where['$and'] = mainAnd;
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
                .exec();
            resolve(new SearchResult<IRelationship>(page, count, pageSize, list));
        } catch (e) {
            reject(e);
        }
    });
});

/* tslint:disable:max-func-body-length */
RelationshipSchema.static('searchByIdentitiesInDateRange', (subjectIdValue: string,
                                                            delegateIdValue: string,
                                                            relationshipType: string,
                                                            status: string,
                                                            date: Date,
                                                            page: number,
                                                            reqPageSize: number) => {
    return new Promise<SearchResult<IRelationship>>(async(resolve, reject) => {
        const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        try {
            const subject = await PartyModel.findByIdentityIdValue(subjectIdValue);
            const delegate = await PartyModel.findByIdentityIdValue(delegateIdValue);
            let mainAnd: {[key: string]: Object}[] = [];
            mainAnd.push({'subject': subject});
            mainAnd.push({'delegate': delegate});
            if (relationshipType) {
                mainAnd.push({'_relationshipTypeCode': relationshipType});
            }
            if (status) {
                mainAnd.push({'status': status});
            }
            const date = new Date();
            mainAnd.push({'startTimestamp': {$lte: date}});
            mainAnd.push({'$or': [{endTimestamp: null}, {endTimestamp: {$gte: date}}]});
            const where: {[key: string]: Object} = {};
            where['$and'] = mainAnd;
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
                    '_subjectNickNameString': 1,
                    '_delegateNickNameString': 1
                })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .exec();
            resolve(new SearchResult<IRelationship>(page, count, pageSize, list));
        } catch (e) {
            reject(e);
        }
    });
});

/**
 * Returns a paginated list of distinct subjects for relationships which have a delegate matching the one supplied.
 *
 * todo need to optional filters (authorisation management)
 */
/* tslint:disable:max-func-body-length */
RelationshipSchema.static('searchDistinctSubjectsForMe',
    (requestingParty: IParty,
     partyType: string,
     authorisationManagement:string,
     text: string,
     sort: string,
     page: number,
     reqPageSize: number) => {
        return new Promise<SearchResult<IParty>>(async (resolve, reject) => {
            const pageSize: number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
            try {
                const where: {[key: string]: Object} =  {
                    '$match': {
                        '$and': [ { 'delegate': new mongoose.Types.ObjectId(requestingParty.id) } ]
                    }
                };
                if (partyType) {
                    where['$match']['$and'].push({ '_subjectPartyTypeCode': partyType });
                }
                // todo authorisation management
                if (text) {
                    where['$match']['$and'].push({
                        '$or': [
                            { '_subjectNickNameString': new RegExp(text, 'i') },
                            { '_subjectABNString': new RegExp(text, 'i') },
                        ]
                    });
                }
                const count = (await this.RelationshipModel
                    .aggregate([
                        where,
                        {'$group': {'_id': '$subject'}}
                    ])
                    .exec()).length;
                const listOfIds = await this.RelationshipModel
                    .aggregate([
                        where,
                        {'$group': {'_id': '$subject'}}
                    ])
                    .sort({
                        '_subjectNickNameString': !sort || sort === 'asc' ? 1 : -1
                    })
                    .skip((page - 1) * pageSize)
                    .limit(pageSize)
                    .exec();
                const inflatedList = (await PartyModel.populate(listOfIds, {path: '_id'})).map((item: {_id:string}) => item._id);
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