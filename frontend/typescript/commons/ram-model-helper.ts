import {Injectable} from '@angular/core';

import {
    IName,
    IParty,
    IProfileProvider,
    IIdentity,
    IRelationship,
    IRelationshipType,
    ILink,
    IHrefValue
} from '../../../commons/RamAPI2';
import {IRelationshipStatus} from '../../../commons/RamAPI2';

@Injectable()
export class RAMModelHelper {

    public linkByType(type: string, links: ILink[]): ILink {
        for(let link of links) {
            if(link.type === type) {
                return link;
            }
        }
        return null;
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

    public relationshipTypeLabel(relationshipTypeRefs: IHrefValue<IRelationshipType>[], relationship: IRelationship) {
        if (relationshipTypeRefs && relationship) {
            let relationshipType = this.getRelationshipType(relationshipTypeRefs, relationship);
            if (relationshipType) {
                return relationshipType.shortDecodeText;
            }
        }
        return '';
    }

    public relationshipStatusLabel(relationshipStatusRefs: IHrefValue<IRelationshipStatus>[], name: string) {
        const status = this.getRelationshipStatus(relationshipStatusRefs, name);
        console.log(status);
        return status ? status.shortDecodeText : '';
    }

    public profileProviderLabel(profileProviderRefs: IHrefValue<IProfileProvider>[], name: string) {
        const profileProvider = this.getProfileProvider(profileProviderRefs, name);
        return profileProvider ? profileProvider.shortDecodeText : '';
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

    public getRelationshipType(relationshipTypeRefs: IHrefValue<IRelationshipType>[], relationship: IRelationship) {
        let relationshipTypeHref = relationship.relationshipType.href;
        for (let ref of relationshipTypeRefs) {
            if (ref.href === relationshipTypeHref) {
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

    public getProfileProvider(profileProviderRefs: IHrefValue<IProfileProvider>[], code: string) {
        for (let ref of profileProviderRefs) {
            if (ref.value.code === code) {
                return ref.value;
            }
        }
        return null;
    }

}
