import * as relationship from './relationship.model';
// import * as identity from './identity.model';
// import * as party from './party.model';

export class Url {

    public static forRelationshipStatus(model: relationship.RelationshipStatus) {
        return '/api/v1/relationshipStatus/' + encodeURIComponent(model.code);
    }

    public static forRelationship(model: relationship.IRelationship) {
        return '/api/v1/relationship/' + encodeURIComponent(model._id.toString());
    }

}