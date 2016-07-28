import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';

import {
    ILink,
    IHrefValue,
    IName,
    IParty,
    IProfileProvider,
    IIdentity,
    IRelationship,
    IRelationshipStatus,
    IRelationshipType,
    IRole,
    IRoleStatus,
    IRoleType
} from '../../../commons/RamAPI';

@Injectable()
export class RAMModelService {

    // helpers ........................................................................................................

    public displayDate(dateString: string) {
        if (dateString) {
            const date = new Date(dateString);
            const datePipe = new DatePipe();
            return datePipe.transform(date, 'd') + ' ' +
                datePipe.transform(date, 'MMMM') + ' ' +
                datePipe.transform(date, 'yyyy');
        }
        return 'Not specified';
    }

    public displayName(name: IName): string {
        if (name) {
            return name._displayName;
        }
        return '';
    }

    public displayNameForParty(party: IParty): string {
        const resource = this.getDefaultIdentityResource(party);
        return resource ? this.displayName(resource.value.profile.name) : '';
    }

    public displayNameForIdentity(identity: IIdentity): string {
        return identity ? this.displayName(identity.profile.name) : '';
    }

    public abnLabelForParty(party: IParty): string {
        if (party && party.identities && party.identities.length > 0) {
            for (const resource of party.identities) {
                const identity = resource.value;
                if (identity.identityType === 'PUBLIC_IDENTIFIER' && identity.publicIdentifierScheme === 'ABN') {
                    return 'ABN ' + identity.rawIdValue;
                }
            }
            return null;
        }
        return null;
    }

    public partyTypeLabelForParty(party: IParty): string {
        const partyType = party.partyType;
        if (partyType === 'INDIVIDUAL') {
            return 'Individual';
        } else {
            return 'Organisation';
        }
    }

    public isIndividual(identity: IIdentity): boolean {
        return identity && identity.identityType === 'LINK_ID';
    }

    public profileProviderLabel(profileProviderRefs: IHrefValue<IProfileProvider>[], code: string) {
        const profileProvider = this.getProfileProvider(profileProviderRefs, code);
        return profileProvider ? profileProvider.shortDecodeText : '';
    }

    public relationshipTypeLabel(relationshipTypeRefs: IHrefValue<IRelationshipType>[], relationship: IRelationship) {
        if (relationshipTypeRefs && relationship) {
            let relationshipType = this.getRelationshipType(relationshipTypeRefs, relationship);
            if (relationshipType) {
                return relationshipType.shortDecodeText;
            }
        }
        return '';
    }

    public roleTypeLabel(roleTypeRefs: IHrefValue<IRoleType>[], role: IRole) {
        if (roleTypeRefs && role) {
            let roleType = this.getRoleType(roleTypeRefs, role);
            if (roleType) {
                return roleType.shortDecodeText;
            }
        }
        return '';
    }

    public relationshipStatusLabel(relationshipStatusRefs: IHrefValue<IRelationshipStatus>[], code: string) {
        const status = this.getRelationshipStatus(relationshipStatusRefs, code);
        return status ? status.shortDecodeText : '';
    }

    public roleStatusLabel(roleStatusRefs: IHrefValue<IRoleStatus>[], code: string) {
        const status = this.getRoleStatus(roleStatusRefs, code);
        return status ? status.shortDecodeText : '';
    }

    // model lookups ..................................................................................................

    public getLinkByType(type: string, links: ILink[]): ILink {
        for (let link of links) {
            if (link.type === type) {
                return link;
            }
        }
        return null;
    }

    public getDefaultIdentityResource(party: IParty): IHrefValue<IIdentity> {
        if (party && party.identities && party.identities.length > 0) {
            for (let ref of party.identities) {
                const identity = ref.value;
                if (identity.defaultInd) {
                    return ref;
                }
            }
        }
        return null;
    }

    public getProfileProvider(profileProviderRefs: IHrefValue<IProfileProvider>[], code: string) {
        for (let ref of profileProviderRefs) {
            if (ref.value.code === code) {
                return ref.value;
            }
        }
        return null;
    }

    public getRelationshipType(relationshipTypeRefs: IHrefValue<IRelationshipType>[], relationship: IRelationship) {
        let href = relationship.relationshipType.href;
        for (let ref of relationshipTypeRefs) {
            if (ref.href === href) {
                return ref.value;
            }
        }
        return null;
    }

    public getRoleType(roleTypeRefs: IHrefValue<IRoleType>[], role: IRole) {
        let href = role.roleType.href;
        for (let ref of roleTypeRefs) {
            if (ref.href === href) {
                return ref.value;
            }
        }
        return null;
    }

    public getRelationshipStatus(relationshipStatusRefs: IHrefValue<IRelationshipStatus>[], code: string) {
        for (let ref of relationshipStatusRefs) {
            if (ref.value.code === code) {
                return ref.value;
            }
        }
        return null;
    }

    public getRoleStatus(roleStatusRefs: IHrefValue<IRoleStatus>[], code: string) {
        for (let ref of roleStatusRefs) {
            if (ref.value.code === code) {
                return ref.value;
            }
        }
        return null;
    }

}
