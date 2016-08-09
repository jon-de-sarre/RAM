import * as party from './party.model';
import * as relationship from './relationship.model';
import * as identity from './identity.model';

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

    // relationship ...................................................................................................

    public static async forRelationshipStatus(model: relationship.RelationshipStatus): Promise<string> {
        return '/api/v1/relationshipStatus/' + encodeURIComponent(model.code);
    }

    public static async forRelationship(model: relationship.IRelationship): Promise<string> {
        return '/api/v1/relationship/' + encodeURIComponent(model._id.toString());
    }

}