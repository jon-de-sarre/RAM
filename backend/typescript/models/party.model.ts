import * as mongoose from 'mongoose';
import {RAMEnum, IRAMObject, RAMSchema, Assert} from './base';
import {IIdentity, IdentityModel} from './identity.model';
import {RelationshipModel, IRelationship} from './relationship.model';
import {RelationshipTypeModel} from './relationshipType.model';
import {RelationshipAttributeModel, IRelationshipAttribute} from './relationshipAttribute.model';
import {RelationshipAttributeNameModel} from './relationshipAttributeName.model';
import {RoleTypeModel} from './roleType.model';
import {IRole, RoleModel, RoleStatus} from './role.model';
import {IRoleAttribute, RoleAttributeModel} from './roleAttribute.model';
import {IAgencyUser} from './agencyUser.model';
import {RoleAttributeNameModel} from './roleAttributeName.model';
import {
    HrefValue,
    Party as DTO,
    PartyType as PartyTypeDTO,
    Identity as IdentityDTO,
    IInvitationCodeRelationshipAddDTO,
    Role as RoleDTO,
    IRelationship as IRelationshipDTO
} from '../../../commons/RamAPI';

/* tslint:disable:no-unused-variable */
const _RoleAttributeModel = RoleAttributeModel;

/* tslint:disable:no-unused-variable */
const _RelationshipTypeModel = RelationshipTypeModel;

// enums, utilities, helpers ..........................................................................................

export class PartyType extends RAMEnum {

    public static ABN = new PartyType('ABN', 'ABN');
    public static Individual = new PartyType('INDIVIDUAL', 'Individual');

    protected static AllValues = [
        PartyType.ABN,
        PartyType.Individual,
    ];

    constructor(code: string, shortDecodeText: string) {
        super(code, shortDecodeText);
    }

    public toHrefValue(includeValue: boolean): Promise<HrefValue<PartyTypeDTO>> {
        return Promise.resolve(new HrefValue(
            '/api/v1/partyType/' + this.code,
            includeValue ? this.toDTO() : undefined
        ));
    }

    public toDTO(): PartyTypeDTO {
        return new PartyTypeDTO(this.code, this.shortDecodeText);
    }
}

// schema .............................................................................................................

const PartySchema = RAMSchema({
    partyType: {
        type: String,
        required: [true, 'Party Type is required'],
        trim: true,
        enum: PartyType.valueStrings()
    }
});

// interfaces .........................................................................................................

export interface IParty extends IRAMObject {
    partyType:string;
    partyTypeEnum():PartyType;
    toHrefValue(includeValue: boolean):Promise<HrefValue<DTO>>;
    toDTO():Promise<DTO>;
    addRelationship(dto: IInvitationCodeRelationshipAddDTO):Promise<IRelationship>;
    addRelationship2(relationshipDTO: IRelationshipDTO):Promise<IRelationship>;
    addRole(role: IRole, agencyUser: IAgencyUser):Promise<IRole>;
}

/* tslint:disable:no-empty-interfaces */
export interface IPartyModel extends mongoose.Model<IParty> {
    findByIdentityIdValue:(idValue: string) => Promise<IParty>;
    hasAccess:(requestingParty: IParty, requestedIdValue: string) => Promise<boolean>;
}

// instance methods ...................................................................................................

PartySchema.method('partyTypeEnum', function () {
    return PartyType.valueOf(this.partyType);
});

PartySchema.method('toHrefValue', async function (includeValue: boolean) {
    const defaultIdentity = await IdentityModel.findDefaultByPartyId(this.id);
    if (defaultIdentity) {
        return new HrefValue(
            '/api/v1/party/identity/' + encodeURIComponent(defaultIdentity.idValue),
            includeValue ? await this.toDTO() : undefined
        );
    } else {
        throw new Error('Default Identity not found');
    }
});

PartySchema.method('toDTO', async function () {
    const identities = await IdentityModel.listByPartyId(this.id);
    return new DTO(
        this.partyType,
        await Promise.all<HrefValue<IdentityDTO>>(identities.map(
            async (identity: IIdentity) => {
                return await identity.toHrefValue(true);
            }))
    );
});

/**
 * Creates a relationship to a temporary identity (InvitationCode) until the invitation has been accepted, whereby
 * the relationship will be transferred to the authorised identity.
 */
/* tslint:disable:max-func-body-length */
PartySchema.method('addRelationship', async (dto: IInvitationCodeRelationshipAddDTO) => {

    // TODO improve handling of lookups that return null outside of the date range

    // lookups
    const relationshipType = await RelationshipTypeModel.findByCodeInDateRange(dto.relationshipType, new Date());
    const subjectIdentity = await IdentityModel.findByIdValue(dto.subjectIdValue);

    // create the temp identity for the invitation code
    const temporaryDelegateIdentity = await IdentityModel.createInvitationCodeIdentity(
        dto.delegate.givenName,
        dto.delegate.familyName,
        dto.delegate.sharedSecretValue
    );

    const attributes: IRelationshipAttribute[] = [];

    for (let attr of dto.attributes) {
        const attributeName = await RelationshipAttributeNameModel.findByCodeInDateRange(attr.code, new Date());
        if (attributeName) {
            attributes.push(await RelationshipAttributeModel.create({
                value: attr.value,
                attributeName: attributeName
            }));
        }
    }

    // create the relationship
    const relationship = await RelationshipModel.add(
        relationshipType,
        subjectIdentity.party,
        subjectIdentity.profile.name,
        temporaryDelegateIdentity,
        dto.startTimestamp,
        dto.endTimestamp,
        attributes
    );

    return relationship;

});

/* tslint:disable:max-func-body-length */
PartySchema.method('addRelationship2', async function (dto: IRelationshipDTO) {

    /* tslint:disable:max-func-body-length */
    let findAfterSearchString = (href: string, searchString: string) => {
        let idValue:string = null;
        if (href.startsWith(searchString)) {
            idValue = decodeURIComponent(href.substr(searchString.length));
        }
        return idValue;
    };

    // lookups
    const relationshipTypeCode = findAfterSearchString(dto.relationshipType.href, '/api/v1/relationshipType/');
    const relationshipType = await RelationshipTypeModel.findByCodeInDateRange(relationshipTypeCode, new Date()); // todo what if find after search string returns null?
    const delegateIdValue = findAfterSearchString(dto.delegate.href, '/api/v1/party/identity/');
    const delegateIdentity = await IdentityModel.findByIdValue(delegateIdValue);
    const subjectIdentity = await IdentityModel.findDefaultByPartyId(this.id);

    const attributes: IRelationshipAttribute[] = [];

    for (let attr of dto.attributes) {
        const attributeName = await RelationshipAttributeNameModel.findByCodeInDateRange(attr.attributeName.value.code, new Date());
        if (attributeName) {
            attributes.push(await RelationshipAttributeModel.create({
                value: attr.value,
                attributeName: attributeName
            }));
        }
    }

    // create the relationship
    return RelationshipModel.add2(
        relationshipType,
        this,
        subjectIdentity.profile.name,
        delegateIdentity.party,
        delegateIdentity.profile.name,
        dto.startTimestamp,
        dto.endTimestamp,
        attributes
    );

});

PartySchema.method('addRole', async function (roleDTO: RoleDTO, agencyUser: IAgencyUser) {

    const now = new Date();
    const roleTypeCode = roleDTO.roleType.value.code;
    const roleType = await RoleTypeModel.findByCodeInDateRange(roleTypeCode, now);
    Assert.assertTrue(roleType !== null, 'Role type invalid');

    let role:IRole = await RoleModel.findByRoleTypeAndParty(roleType, this);
    if (role === null) {
        role = await RoleModel.create({
            roleType: roleType,
            party: this,
            startTimestamp: now,
            status: RoleStatus.Active.code,
            attributes: []
        });
    }

    const roleAttributes: IRoleAttribute[] = [];

    let processAttribute = async (code: string, value: string, roleAttributes: IRoleAttribute[], role: IRole) => {
        const roleAttributeName = await RoleAttributeNameModel.findByCodeIgnoringDateRange(code);
        if (roleAttributeName) {
            const filteredRoleAttributes = role.attributes.filter((item) => {
                return item.attributeName.code === code;
            });
            if (filteredRoleAttributes.length === 0) {
                roleAttributes.push(await RoleAttributeModel.create({
                    value: value,
                    attributeName: roleAttributeName
                }));
            } else {
                const filteredRoleAttribute = filteredRoleAttributes[0];
                filteredRoleAttribute.value = value;
                await filteredRoleAttribute.save();
                roleAttributes.push(filteredRoleAttribute);
            }
        }
    };

    await processAttribute('CREATOR_ID', agencyUser.id, roleAttributes, role);
    await processAttribute('CREATOR_NAME', agencyUser.displayName, roleAttributes, role);
    await processAttribute('CREATOR_AGENCY', agencyUser.agency, roleAttributes, role);

    for (let roleAttribute of roleDTO.attributes) {
        const roleAttributeValue = roleAttribute.value;
        const roleAttributeNameCode = roleAttribute.attributeName.value.code;
        const roleAttributeNameCategory = roleAttribute.attributeName.value.category;

        let shouldSave = false;
        if (roleAttribute.attributeName.value.classifier === 'AGENCY_SERVICE') {
            for (let programRole of agencyUser.programRoles) {
                if (programRole.role === 'ROLE_ADMIN' && programRole.program === roleAttributeNameCategory) {
                    shouldSave = true;
                    break;
                }
            }
        } else {
            shouldSave = true;
        }

        if (shouldSave) {
            await processAttribute(roleAttributeNameCode, roleAttributeValue, roleAttributes, role);
        }
    }

    role.attributes = roleAttributes;

    role.saveAttributes();

    return Promise.resolve(role);

});

// static methods .....................................................................................................

PartySchema.static('findByIdentityIdValue', async (idValue: string) => {
    const identity = await IdentityModel.findByIdValue(idValue);
    return identity ? identity.party : null;
});

PartySchema.static('hasAccess', async (requestingParty: IParty, requestedIdValue: string) => {
    const requestedIdentity = await IdentityModel.findByIdValue(requestedIdValue);
    if (requestedIdentity) {
        const requestedParty = requestedIdentity.party;
        if (requestingParty.id === requestedParty.id) {
            return true;
        } else {
            return await RelationshipModel.hasActiveInDateRange1stOr2ndLevelConnection(
                requestingParty,
                requestedIdValue,
                new Date()
            );
        }
    }
    return false;
});

// concrete model .....................................................................................................

export const PartyModel = mongoose.model(
    'Party',
    PartySchema) as IPartyModel;