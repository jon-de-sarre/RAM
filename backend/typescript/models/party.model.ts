import * as mongoose from 'mongoose';
import {RAMEnum, IRAMObject, RAMSchema, Assert} from './base';
import {IIdentity, IdentityModel} from './identity.model';
import {
    HrefValue,
    Party as DTO,
    PartyType as PartyTypeDTO,
    Identity as IdentityDTO,
    IInvitationCodeRelationshipAddDTO,
    Role as RoleDTO
} from '../../../commons/RamAPI';
import {RelationshipModel, IRelationship} from './relationship.model';
import {RelationshipTypeModel} from './relationshipType.model';
import {RelationshipAttributeModel, IRelationshipAttribute} from './relationshipAttribute.model';
import {RelationshipAttributeNameModel} from './relationshipAttributeName.model';
import {RoleTypeModel} from './roleType.model';
import {IRole, RoleModel, RoleStatus} from './role.model';
import {IRoleAttribute, RoleAttributeModel} from './roleAttribute.model';
import {IAgencyUser} from './agencyUser.model';
import {RoleAttributeNameModel} from './roleAttributeName.model';

/* tslint:disable:no-unused-variable */
const _RoleAttributeModel = RoleAttributeModel;

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

PartySchema.method('addRole', async function (roleDTO: RoleDTO, agencyUser: IAgencyUser) {

    console.log('roleDTO', JSON.stringify(roleDTO, null, 4));

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

    for (let roleAttribute of roleDTO.attributes) {
        const roleAttributeValue = roleAttribute.value;
        const roleAttributeNameCode = roleAttribute.attributeName.value.code;
        const roleAttributeNameCategory = roleAttribute.attributeName.value.category;

        console.log('roleAttributeValue=' + roleAttributeValue);
        console.log('roleAttributeNameCode=' + roleAttributeNameCode);
        console.log('roleAttributeNameCategory=' + roleAttributeNameCategory);

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
            const roleAttributeName = await RoleAttributeNameModel.findByCodeIgnoringDateRange(roleAttributeNameCode);
            if (roleAttributeName) {
                roleAttributes.push(await RoleAttributeModel.create({
                    value: roleAttributeValue,
                    attributeName: roleAttributeName
                }));
            }
        }

        const creatorIdRoleAttributeName = await RoleAttributeNameModel.findByCodeIgnoringDateRange('CREATOR_ID');
        if (creatorIdRoleAttributeName) {
            roleAttributes.push(await RoleAttributeModel.create({
                value: agencyUser.id,
                attributeName: creatorIdRoleAttributeName
            }));
        }

        const creatorNameRoleAttributeName = await RoleAttributeNameModel.findByCodeIgnoringDateRange('CREATOR_NAME');
        if (creatorNameRoleAttributeName) {
            roleAttributes.push(await RoleAttributeModel.create({
                value: agencyUser.displayName,
                attributeName: creatorNameRoleAttributeName
            }));
        }

        const creatorAgencyRoleAttributeName = await RoleAttributeNameModel.findByCodeIgnoringDateRange('CREATOR_AGENCY');
        if (creatorAgencyRoleAttributeName) {
            roleAttributes.push(await RoleAttributeModel.create({
                value: agencyUser.agency,
                attributeName: creatorAgencyRoleAttributeName
            }));
        }

        role.attributes = roleAttributes;
        role.saveAttributes();

        console.log('----');

    }

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