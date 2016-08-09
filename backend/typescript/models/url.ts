import * as identity from './identity.model';
import * as party from './party.model';
import * as profile from './profile.model';
import * as relationship from './relationship.model';
import * as relationshipAttributeName from './relationshipAttributeName.model';
import * as relationshipType from './relationshipType.model';

export class Url {

    // party ..........................................................................................................

    public static async forPartyType(model: party.PartyType): Promise<string> {
        return '/api/v1/partyType/' + encodeURIComponent(model.code);
    }

    public static async forParty(model: party.IParty): Promise<string> {
        const defaultIdentity = await identity.IdentityModel.findDefaultByPartyId(model.id);
        if (defaultIdentity) {
            return '/api/v1/party/identity/' + encodeURIComponent(encodeURIComponent(defaultIdentity.idValue));
        } else {
            throw new Error('Default Identity not found');
        }
    }

    // profile ........................................................................................................

    public static async forProfileProvider(model: profile.ProfileProvider): Promise<string> {
        return '/api/v1/profileProvider/' + encodeURIComponent(model.code);
    }

    // relationship ...................................................................................................

    public static async forRelationshipStatus(model: relationship.RelationshipStatus): Promise<string> {
        return '/api/v1/relationshipStatus/' + encodeURIComponent(model.code);
    }

    public static async forRelationship(model: relationship.IRelationship): Promise<string> {
        return '/api/v1/relationship/' + encodeURIComponent(model._id.toString());
    }

    // relationship attribute name ....................................................................................

    public static async forRelationshipAttributeName(model: relationshipAttributeName.IRelationshipAttributeName): Promise<string> {
        return '/api/v1/relationshipAttributeName/' + encodeURIComponent(model.code);
    }

    // relationship type ..............................................................................................

    public static async forRelationshipType(model: relationshipType.IRelationshipType): Promise<string> {
        return '/api/v1/relationshipType/' + encodeURIComponent(model.code);
    }

}