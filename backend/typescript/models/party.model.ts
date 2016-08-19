import * as mongoose from 'mongoose';
import {RAMEnum, IRAMObject, RAMSchema, Assert} from './base';
import {Url} from './url';
import {IIdentity, IdentityModel} from './identity.model';
import {RelationshipModel, IRelationship, RelationshipInitiatedBy} from './relationship.model';
import {RelationshipTypeModel} from './relationshipType.model';
import {RelationshipAttributeModel, IRelationshipAttribute} from './relationshipAttribute.model';
import {RelationshipAttributeNameModel} from './relationshipAttributeName.model';
import {RoleTypeModel} from './roleType.model';
import {IRole, RoleModel, RoleStatus} from './role.model';
import {IRoleAttribute, RoleAttributeModel} from './roleAttribute.model';
import {IAgencyUser} from './agencyUser.model';
import {RoleAttributeNameModel, IRoleAttributeName} from './roleAttributeName.model';
import {IPrincipal} from './principal.model';
import {
    HrefValue,
    Party as DTO,
    PartyType as PartyTypeDTO,
    Identity as IdentityDTO,
    IInvitationCodeRelationshipAddDTO,
    Role as RoleDTO,
    IRelationship as IRelationshipDTO
} from '../../../commons/RamAPI';
import {context} from '../providers/context.provider';
import {logger} from "../logger";

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

    public async toHrefValue(includeValue: boolean): Promise<HrefValue<PartyTypeDTO>> {
        return Promise.resolve(new HrefValue(
            await Url.forPartyType(this),
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
    addOrModifyRole(role: IRole, agencyUser: IAgencyUser):Promise<IRole>;
    modifyRole(role: IRole):Promise<IRole>;
}

/* tslint:disable:no-empty-interfaces */
export interface IPartyModel extends mongoose.Model<IParty> {
    findByIdentityIdValue:(idValue: string) => Promise<IParty>;
    hasAccess:(requestedIdValue: string, requestingPrincipal: IPrincipal, requestingIdentity: IIdentity) => Promise<boolean>;
}

// instance methods ...................................................................................................

PartySchema.method('partyTypeEnum', function () {
    return PartyType.valueOf(this.partyType);
});

PartySchema.method('toHrefValue', async function (includeValue: boolean) {
        return new HrefValue(
            await Url.forParty(this),
            includeValue ? await this.toDTO() : undefined
        );
});

PartySchema.method('toDTO', async function () {
    const identities = await IdentityModel.listByPartyId(this.id);
    return new DTO(
        Url.links()
            .push('self', Url.GET, await Url.forParty(this))
            .toArray(),
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
 *
 */
/* tslint:disable:max-func-body-length */
// TODO delete this method and use a more generic addRelationship2 which will either create an invitation code OR use provided subject and delegate
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
    const relationship = await RelationshipModel.add2(
        relationshipType,
        subjectIdentity.party,
        subjectIdentity.profile.name,
        temporaryDelegateIdentity.party,
        temporaryDelegateIdentity.profile.name,
        dto.startTimestamp,
        dto.endTimestamp,
        RelationshipInitiatedBy.Subject,
        temporaryDelegateIdentity,
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
        RelationshipInitiatedBy.valueOf(dto.initiatedBy),
        null,
        attributes
    );

});

PartySchema.method('addOrModifyRole', async function (roleDTO: RoleDTO, agencyUser: IAgencyUser) {

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

    let processAttribute = async (code: string, value: string[], roleAttributes: IRoleAttribute[], role: IRole) => {
        const roleAttributeName = await RoleAttributeNameModel.findByCodeIgnoringDateRange(code);
        if (roleAttributeName) {
            const filteredRoleAttributes = role.attributes.filter((item) => {
                return item.attributeName.code === code;
            });
            const roleAttributeDoesNotExist = filteredRoleAttributes.length === 0;
            if (roleAttributeDoesNotExist) {
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

    await processAttribute('CREATOR_ID', [agencyUser.id], roleAttributes, role);
    await processAttribute('CREATOR_NAME', [agencyUser.displayName], roleAttributes, role);
    await processAttribute('CREATOR_AGENCY', [agencyUser.agency], roleAttributes, role);

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

PartySchema.method('modifyRole', async function (roleDTO: RoleDTO) {
    logger.info('about to modify role');
    const principal = context.getAuthenticatedPrincipal();

    const now = new Date();

    const roleTypeCode = Url.lastPathElement(roleDTO.roleType.href);
    Assert.assertNotNull(roleTypeCode, 'Role type code from href invalid');

    const roleType = await RoleTypeModel.findByCodeInDateRange(roleTypeCode, now);
    Assert.assertTrue(roleType !== null, 'Role type invalid');

    const role = await RoleModel.findByRoleTypeAndParty(roleType, this);
    Assert.assertNotNull(role, 'Party does not have role type');

    const roleAttributes = role.attributes;

    // todo move this into the role object
    let updateOrCreateRoleAttributeIfExists = async(roleAttributeName: IRoleAttributeName, value: string[], role: IRole) => {
        const existingAttribute = await role.findAttribute(roleAttributeName.code);
        if (!existingAttribute) {
            logger.debug(`Adding new RoleAttribute ${roleAttributeName.code}`);
            roleAttributes.push(await RoleAttributeModel.create({
                value: value,
                attributeName: roleAttributeName
            }));
        } else {
            logger.debug(`Updating existing RoleAttribute ${roleAttributeName.code}`);
            existingAttribute.value = value;
            await existingAttribute.save();
        }
    };

    if (principal.agencyUserInd) {
        await updateOrCreateRoleAttributeIfExists(await RoleAttributeNameModel.findByCodeIgnoringDateRange('CREATOR_ID'), [principal.agencyUser.id], role);
        await updateOrCreateRoleAttributeIfExists(await RoleAttributeNameModel.findByCodeIgnoringDateRange('CREATOR_NAME'), [principal.agencyUser.displayName], role);
        await updateOrCreateRoleAttributeIfExists(await RoleAttributeNameModel.findByCodeIgnoringDateRange('CREATOR_AGENCY'), [principal.agencyUser.agency], role);
    }

    for (let roleAttribute of roleDTO.attributes) {
        const roleAttributeValue = roleAttribute.value;
        const roleAttributeNameCode = roleAttribute.attributeName.value.code;
        const roleAttributeNameCategory = roleAttribute.attributeName.value.category;

        const existingAttributeName = await RoleAttributeNameModel.findByCodeIgnoringDateRange(roleAttributeNameCode);

        if(existingAttributeName) {
            logger.debug(`Processing ${existingAttributeName.code}`);
            // add/update agency services that have been specified applying filtering by agency user role
            if (principal.agencyUser && existingAttributeName.classifier === 'AGENCY_SERVICE') {
                logger.debug(`Processing agency service ${existingAttributeName.code}`);
                if (principal.agencyUser.hasRoleForProgram('ROLE_ADMIN', existingAttributeName.category)) {
                    logger.debug(`Processing agency service for admin ${existingAttributeName.code}`);
                    await updateOrCreateRoleAttributeIfExists(existingAttributeName, roleAttributeValue, role);
                }
            }

            // add/update non agency services attributes
            if (existingAttributeName.classifier !== 'AGENCY_SERVICE') {
                await updateOrCreateRoleAttributeIfExists(existingAttributeName, roleAttributeValue, role);
            }

        }
    }

    // remove any agency services this user has access to but were not specified
    if(principal.agencyUserInd) {
        for (let attribute of role.attributes) {
            logger.debug(`testing attribute ${attribute.attributeName.code}`);
            // find services
            if(attribute.attributeName.classifier === 'AGENCY_SERVICE') {
                logger.debug(`testing agency service ${attribute.attributeName.code}`);
                // if this user has ROLE_ADMIN for this category
                if(principal.agencyUser.hasRoleForProgram('ROLE_ADMIN', attribute.attributeName.category)) {
                    logger.debug(`has role admin ${attribute.attributeName.code}`);
                    // then IF this service was NOT supplied it must be deleted
                    let matchingAttributes = roleDTO.attributes.filter( (val) => {
                        return val.attributeName.value.code === attribute.attributeName.code &&
                            val.attributeName.value.category === attribute.attributeName.category &&
                            val.attributeName.value.classifier === attribute.attributeName.classifier
                    });

                    if(matchingAttributes.length === 0) {
                        logger.warn(`Delete ${attribute.attributeName.code}`);
                        await role.deleteAttribute(attribute.attributeName.code, 'AGENCY_SERVICE');
                    }
                }
            }
        }
    }

    await role.saveAttributes();

    return Promise.resolve(role);

});

// static methods .....................................................................................................

PartySchema.static('findByIdentityIdValue', async (idValue: string) => {
    const identity = await IdentityModel.findByIdValue(idValue);
    return identity ? identity.party : null;
});

PartySchema.static('hasAccess', async (requestedIdValue: string, requestingPrincipal: IPrincipal, requestingIdentity: IIdentity) => {
    const requestedIdentity = await IdentityModel.findByIdValue(requestedIdValue);
    if (requestedIdentity) {
        // requested party exists
        if (requestingPrincipal && requestingPrincipal.agencyUserInd) {
            // agency users have implicit global access
            return true;
        } else if (requestingIdentity) {
            // regular users have explicit access
            let requestingParty = requestingIdentity.party;
            const requestedParty = requestedIdentity.party;
            if (requestingParty.id === requestedParty.id) {
                // requested and requester are the same
                return true;
            } else {
                // check 1st and 2nd level relationships
                return await RelationshipModel.hasActiveInDateRange1stOr2ndLevelConnection(
                    requestingParty,
                    requestedIdValue,
                    new Date()
                );
            }
        }
    }
    return false;
});

// concrete model .....................................................................................................

export const PartyModel = mongoose.model(
    'Party',
    PartySchema) as IPartyModel;