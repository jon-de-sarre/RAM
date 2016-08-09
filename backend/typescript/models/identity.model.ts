import * as mongoose from 'mongoose';
import * as mongooseAutoIncrement from 'mongoose-auto-increment';
import {conf} from '../bootstrap';
import * as Hashids from 'hashids';
import {RAMEnum, IRAMObject, RAMSchema} from './base';
import {Url} from './url';
import {
    HrefValue,
    Identity as DTO,
    SearchResult,
    ICreateIdentityDTO
} from '../../../commons/RamAPI';
import {NameModel} from './name.model';
import {SharedSecretModel} from './sharedSecret.model';
import {IProfile, ProfileModel, ProfileProvider} from './profile.model';
import {IParty, PartyModel, PartyType} from './party.model';
import {SharedSecretTypeModel, DOB_SHARED_SECRET_TYPE_CODE} from './sharedSecretType.model';

// force schema to load first (see https://github.com/atogov/RAM/pull/220#discussion_r65115456)

/* tslint:disable:no-unused-variable */
const _ProfileModel = ProfileModel;

/* tslint:disable:no-unused-variable */
const _PartyModel = PartyModel;

const MAX_PAGE_SIZE = 100;
const NEW_INVITATION_CODE_EXPIRY_DAYS = 7;

/*
 * It is always possible that the name returned by the ABR is different to the
 * company name already recorded in RAM. Add an additional identity to overcome
 * this limitation.
 */
const addCompanyNameIfNeeded = async (identity:IIdentity, name:string):Promise<IIdentity> => {
    // TODO: implement if we want a total merge - not urgent
    return identity;
};

// enums, utilities, helpers ..........................................................................................

const saltedHashids = new Hashids(conf.hashIdsSalt, 6, 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789');

const getNewInvitationCodeExpiry = ():Date => {
    let date = new Date();
    date.setDate(date.getDate() + NEW_INVITATION_CODE_EXPIRY_DAYS);
    return date;
};

export class IdentityType extends RAMEnum {

    public static AgencyProvidedToken = new IdentityType('AGENCY_PROVIDED_TOKEN', 'Agency Provided Token')
        .withIdValueBuilder((identity:IIdentity):String => {
            return identity.identityType + ':' + identity.agencyScheme + ':' + identity.rawIdValue;
        });

    public static InvitationCode = new IdentityType('INVITATION_CODE', 'Invitation Code')
        .withIdValueBuilder((identity:IIdentity):String => {
            return identity.identityType + ':' + identity.rawIdValue;
        });

    public static LinkId = new IdentityType('LINK_ID', 'Link ID')
        .withIdValueBuilder((identity:IIdentity):String => {
            return identity.identityType + ':' + identity.linkIdScheme + ':' + identity.rawIdValue;
        });

    public static PublicIdentifier = new IdentityType('PUBLIC_IDENTIFIER', 'Public Identifier')
        .withIdValueBuilder((identity:IIdentity):String => {
            return identity.identityType + ':' + identity.publicIdentifierScheme + ':' + identity.rawIdValue;
        });

    protected static AllValues = [
        IdentityType.AgencyProvidedToken,
        IdentityType.InvitationCode,
        IdentityType.LinkId,
        IdentityType.PublicIdentifier
    ];

    public buildIdValue:(identity:IIdentity) => String;

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }

    public withIdValueBuilder(builder:(identity:IIdentity) => String):IdentityType {
        this.buildIdValue = builder;
        return this;
    }
}

export class IdentityInvitationCodeStatus extends RAMEnum {

    public static Claimed = new IdentityInvitationCodeStatus('CLAIMED', 'Claimed');
    public static Pending = new IdentityInvitationCodeStatus('PENDING', 'Pending');
    public static Rejected = new IdentityInvitationCodeStatus('REJECTED', 'Rejected');//TODO this state is not possible?

    protected static AllValues = [
        IdentityInvitationCodeStatus.Claimed,
        IdentityInvitationCodeStatus.Pending,
        IdentityInvitationCodeStatus.Rejected
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

export class IdentityAgencyScheme extends RAMEnum {

    public static Medicare = new IdentityAgencyScheme('MEDICARE', 'Medicare');

    protected static AllValues = [
        IdentityAgencyScheme.Medicare
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

export class IdentityPublicIdentifierScheme extends RAMEnum {

    public static ABN = new IdentityPublicIdentifierScheme('ABN', 'ABN');

    protected static AllValues = [
        IdentityPublicIdentifierScheme.ABN
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

export class IdentityLinkIdScheme extends RAMEnum {

    public static AUSkey = new IdentityPublicIdentifierScheme('AUSKEY', 'AUSkey');
    public static AuthenticatorApp = new IdentityPublicIdentifierScheme('AUTHENTICATOR_APP', 'Authenticator App');
    public static MyGov = new IdentityPublicIdentifierScheme('MY_GOV', 'myGov');

    protected static AllValues = [
        IdentityLinkIdScheme.AUSkey,
        IdentityLinkIdScheme.AuthenticatorApp,
        IdentityLinkIdScheme.MyGov
    ];

    constructor(code:string, shortDecodeText:string) {
        super(code, shortDecodeText);
    }
}

// schema .............................................................................................................

const IdentitySchema = RAMSchema({
    idValue: {
        type: String,
        required: [true, 'Id Value is required'],
        trim: true
    },
    rawIdValue: {
        type: String,
        required: [true, 'Raw Id Value is required'],
        trim: true
    },
    identityType: {
        type: String,
        required: [true, 'Identity Type is required'],
        trim: true,
        enum: IdentityType.valueStrings()
    },
    defaultInd: {
        type: Boolean,
        required: [true, 'Default Indicator is required'],
        default: false
    },
    agencyScheme: {
        type: String,
        trim: true,
        required: [function () {
            return this.identityType === IdentityType.AgencyProvidedToken.code;
        }, 'Agency Scheme is required'],
        enum: IdentityAgencyScheme.valueStrings()
    },
    agencyToken: {
        type: String,
        trim: true,
        required: [function () {
            return this.identityType === IdentityType.AgencyProvidedToken.code;
        }, 'Agency Token is required']
    },
    invitationCodeStatus: {
        type: String,
        trim: true,
        required: [function () {
            return this.identityType === IdentityType.InvitationCode.code;
        }, 'Invitation Code Status is required'],
        enum: IdentityInvitationCodeStatus.valueStrings()
    },
    invitationCodeExpiryTimestamp: {
        type: Date,
        required: [function () {
            return this.identityType === IdentityType.InvitationCode.code;
        }, 'Invitation Code Expiry is required']
    },
    invitationCodeClaimedTimestamp: {
        type: Date,
        required: [function () {
            return this.identityType === IdentityType.InvitationCode.code &&
                this.invitationCodeStatus === IdentityInvitationCodeStatus.Claimed.code;
        }, 'Invitation Code Claimed Timestamp is required']
    },
    invitationCodeTemporaryEmailAddress: {
        type: String,
        trim: true
    },
    linkIdScheme: {
        type: String,
        trim: true,
        required: [function () {
            return this.identityType === IdentityType.LinkId.code;
        }, 'Link Id Scheme is required'],
        enum: IdentityLinkIdScheme.valueStrings()
    },
    linkIdConsumer: {
        type: String,
        trim: true
    },
    publicIdentifierScheme: {
        type: String,
        trim: true,
        required: [function () {
            return this.identityType === IdentityType.PublicIdentifier.code;
        }, 'Public Identifier Scheme is required'],
        enum: IdentityPublicIdentifierScheme.valueStrings()
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile is required']
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: [true, 'Party is required']
    }
});

mongooseAutoIncrement.initialize(mongoose.connection);
IdentitySchema.plugin(mongooseAutoIncrement.plugin, {model: 'Identity', field: 'seq'});

IdentitySchema.pre('validate', function (next:() => void) {
    const identityType = IdentityType.valueOf(this.identityType) as IdentityType;
    if (identityType === IdentityType.InvitationCode && !this.rawIdValue) {
        this.nextCount((err:Error, count:number) => {
            this.rawIdValue = saltedHashids.encode(count);
            this.idValue = identityType ? identityType.buildIdValue(this) : null;
            next();
        });
    } else {
        this.idValue = identityType ? identityType.buildIdValue(this) : null;
        next();
    }
});

// interfaces .........................................................................................................

export interface IIdentity extends IRAMObject {
    idValue:string;
    rawIdValue:string;
    identityType:string;
    defaultInd:boolean;
    agencyScheme:string;
    agencyToken:string;
    invitationCodeStatus:string;
    invitationCodeExpiryTimestamp:Date;
    invitationCodeClaimedTimestamp:Date;
    invitationCodeTemporaryEmailAddress:string;
    linkIdScheme:string;
    linkIdConsumer:string;
    publicIdentifierScheme:string;
    profile:IProfile;
    party:IParty;
    identityTypeEnum():IdentityType;
    agencySchemeEnum():IdentityAgencyScheme;
    invitationCodeStatusEnum():IdentityInvitationCodeStatus;
    publicIdentifierSchemeEnum():IdentityPublicIdentifierScheme;
    linkIdSchemeEnum():IdentityLinkIdScheme;
    toHrefValue(includeValue:boolean):Promise<HrefValue<DTO>>;
    toDTO():Promise<DTO>;
}

export interface IIdentityModel extends mongoose.Model<IIdentity> {
    createFromDTO:(dto:ICreateIdentityDTO) => Promise<IIdentity>;
    createInvitationCodeIdentity:(givenName:string, familyName:string, dateOfBirth:string) => Promise<IIdentity>;
    addCompany:(abn:string,name:string) => Promise<IIdentity>;
    findByIdValue:(idValue:string) => Promise<IIdentity>;
    findByInvitationCode:(invitationCode:string) => Promise<IIdentity>;
    findPendingByInvitationCodeInDateRange:(invitationCode:string, date:Date) => Promise<IIdentity>;
    findDefaultByPartyId:(partyId:string) => Promise<IIdentity>;
    listByPartyId:(partyId:string) => Promise<IIdentity[]>;
    searchLinkIds:(page:number, pageSize:number) => Promise<SearchResult<IIdentity>>;
}

// instance methods ...................................................................................................

IdentitySchema.method('identityTypeEnum', function () {
    return IdentityType.valueOf(this.identityType);
});

IdentitySchema.method('agencySchemeEnum', function () {
    return IdentityAgencyScheme.valueOf(this.agencyScheme);
});

IdentitySchema.method('invitationCodeStatusEnum', function () {
    return IdentityInvitationCodeStatus.valueOf(this.invitationCodeStatus);
});

IdentitySchema.method('publicIdentifierSchemeEnum', function () {
    return IdentityPublicIdentifierScheme.valueOf(this.publicIdentifierScheme);
});

IdentitySchema.method('linkIdSchemeEnum', function () {
    return IdentityLinkIdScheme.valueOf(this.linkIdScheme);
});

IdentitySchema.method('toHrefValue', async function (includeValue:boolean) {
    return new HrefValue(
        await Url.forIdentity(this),
        includeValue ? await this.toDTO() : undefined
    );
});

IdentitySchema.method('toDTO', async function () {
    return new DTO(
        Url.links()
            .push('relationship-list', Url.GET, await Url.forIdentityRelationshipList(this))
            .push('relationship-create', Url.POST, await Url.forIdentityRelationshipCreate(this))
            .push('role-list', Url.GET, await Url.forIdentityRoleList(this))
            .push('role-create', Url.GET, await Url.forIdentityRoleCreate(this))
            .toArray(),
        this.idValue,
        this.rawIdValue,
        this.identityType,
        this.defaultInd,
        this.agencyScheme,
        this.agencyToken,
        this.invitationCodeStatus,
        this.invitationCodeExpiryTimestamp,
        this.invitationCodeClaimedTimestamp,
        this.invitationCodeTemporaryEmailAddress,
        this.publicIdentifierScheme,
        this.linkIdScheme,
        this.linkIdConsumer,
        await this.profile.toDTO(),
        await this.party.toHrefValue()
    );
});

// static methods .....................................................................................................

IdentitySchema.static('findByIdValue', (idValue:string) => {
    return this.IdentityModel
        .findOne({
            idValue: idValue
        })
        .deepPopulate([
            'profile.name',
            'profile.sharedSecrets.sharedSecretType',
            'party',
            'partyType'
        ])
        .exec();
});

IdentitySchema.static('findByInvitationCode', (invitationCode:string) => {
    return this.IdentityModel
        .findOne({
            rawIdValue: invitationCode,
            identityType: IdentityType.InvitationCode.code
        })
        .deepPopulate([
            'profile.name',
            'profile.sharedSecrets.sharedSecretType',
            'party'
        ])
        .exec();
});

IdentitySchema.static('findPendingByInvitationCodeInDateRange', (invitationCode:string, date:Date) => {
    return this.IdentityModel
        .findOne({
            rawIdValue: invitationCode,
            identityType: IdentityType.InvitationCode.code,
            invitationCodeStatus: IdentityInvitationCodeStatus.Pending.code,
            invitationCodeExpiryTimestamp: {$gte: date}
        })
        .deepPopulate([
            'profile.name',
            'profile.sharedSecrets.sharedSecretType',
            'party'
        ])
        .exec();
});

IdentitySchema.static('findDefaultByPartyId', (partyId:string) => {
    return this.IdentityModel
        .findOne({
            'party': partyId,
            defaultInd: true
        })
        .deepPopulate([
            'profile.name',
            'profile.sharedSecrets.sharedSecretType',
            'party'
        ])
        .sort({createdAt: 1})
        .exec();
});

IdentitySchema.static('listByPartyId', (partyId:string) => {
    return this.IdentityModel
        .find({
            'party': partyId
        })
        .deepPopulate([
            'profile.name',
            'profile.sharedSecrets.sharedSecretType',
            'party'
        ])
        .sort({idValue: 1})
        .exec();
});

IdentitySchema.static('searchLinkIds', (page:number, reqPageSize:number) => {
    return new Promise<SearchResult<IIdentity>>(async (resolve, reject) => {
        const pageSize:number = reqPageSize ? Math.min(reqPageSize, MAX_PAGE_SIZE) : MAX_PAGE_SIZE;
        try {
            const query = {
                identityType: IdentityType.LinkId.code
            };
            const count = await this.IdentityModel
                .count(query)
                .exec();
            const list = await this.IdentityModel
                .find(query)
                .deepPopulate([
                    'profile.name',
                    'party'
                ])
                .sort({'profile.name._displayName': -1})
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .exec();
            resolve(new SearchResult<IIdentity>(page, count, pageSize, list));
        } catch (e) {
            reject(e);
        }
    });
});

/*
 * Used when looking for a company in the ABR. If the ABN already exists in RAM
 * then only the name needs be checked and/or added (TBD). Otherwise a new identity and associated party are created. In either case the party idValue is returned (PUBLIC_IDENTIFIER:ABN:nnnnnnnnnnn).
 */
IdentitySchema.static('addCompany', async (abn: string, name: string):Promise<IIdentity> => {
    const identity = await this.IdentityModel.findByIdValue(abn);
    if (identity) {
        return addCompanyNameIfNeeded(identity, name);
    } else {
        const identity = (await this.IdentityModel.createFromDTO({
            rawIdValue: abn,
            partyType: PartyType.ABN.code,
            givenName: undefined,
            familyName: undefined,
            unstructuredName: name,
            // fun - company has to have a date of birth!!!
            sharedSecretTypeCode: DOB_SHARED_SECRET_TYPE_CODE,
            sharedSecretValue: '01/07/1984',
            identityType: IdentityType.PublicIdentifier.code,
            agencyScheme: undefined,
            agencyToken: undefined,
            linkIdScheme: undefined,
            linkIdConsumer: undefined,
            publicIdentifierScheme: IdentityPublicIdentifierScheme.ABN.code,
            profileProvider: ProfileProvider.ABR.code
        }));
        return identity;
    }
});

IdentitySchema.static('createInvitationCodeIdentity',
    async (givenName:string, familyName:string, dateOfBirth:string):Promise<IIdentity> => {

        return await this.IdentityModel.createFromDTO(
            {
                rawIdValue: undefined,
                partyType: PartyType.Individual.code,
                givenName: givenName,
                familyName: familyName,
                unstructuredName: undefined,
                sharedSecretTypeCode: DOB_SHARED_SECRET_TYPE_CODE,
                sharedSecretValue: dateOfBirth,
                identityType: IdentityType.InvitationCode.code,
                agencyScheme: undefined,
                agencyToken: undefined,
                linkIdScheme: undefined,
                linkIdConsumer: undefined,
                publicIdentifierScheme: undefined,
                profileProvider: ProfileProvider.Invitation.code
            }
        );
});

/**
 * Creates an InvitationCode identity required when creating a new relationship. This identity is temporary and will
 * only be associated with the relationship until the relationship is accepted, whereby the relationship will be
 * transferred to the authorised identity.
 */
/* tslint:disable:max-func-body-length */
IdentitySchema.static('createFromDTO', async(dto:ICreateIdentityDTO):Promise<IIdentity> => {

    const name = await NameModel.create({
        givenName: dto.givenName,
        familyName: dto.familyName,
        unstructuredName: dto.unstructuredName
    });

    const sharedSecret = await SharedSecretModel.create({
        value: dto.sharedSecretValue,
        sharedSecretType: await SharedSecretTypeModel.findByCodeInDateRange(dto.sharedSecretTypeCode, new Date())
    });

    const profile = await ProfileModel.create({
        provider: dto.profileProvider,
        name: name,
        sharedSecrets: [sharedSecret]
    });

    const party = await PartyModel.create({
        partyType: dto.partyType,
        name: name
    });

    const identity = await this.IdentityModel.create({
        rawIdValue: dto.rawIdValue,
        identityType: dto.identityType,
        defaultInd: true,
        agencyScheme: dto.agencyScheme,
        agencyToken: dto.agencyToken,
        invitationCodeStatus: dto.identityType === IdentityType.InvitationCode.code ?
            IdentityInvitationCodeStatus.Pending.code : undefined,
        invitationCodeExpiryTimestamp: dto.identityType === IdentityType.InvitationCode.code ?
            getNewInvitationCodeExpiry() : undefined,
        invitationCodeClaimedTimestamp: undefined,
        publicIdentifierScheme: dto.publicIdentifierScheme,
        linkIdScheme: dto.linkIdScheme,
        linkIdConsumer: dto.linkIdConsumer,
        profile: profile,
        party: party
    });

    return identity;

});

// concrete model .....................................................................................................

export const IdentityModel = mongoose.model(
    'Identity',
    IdentitySchema) as IIdentityModel;
